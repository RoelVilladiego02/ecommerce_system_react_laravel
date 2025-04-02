<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Http\Requests\OrderRequest;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return response()->json(Order::with(['orderItems.product'])->get());
    }

    public function store(OrderRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $total = 0;
            $items = collect($request->items)->map(function ($item) use (&$total) {
                $product = Product::findOrFail($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception('Insufficient stock for ' . $product->name);
                }
                $product->decrement('stock', $item['quantity']);
                $total += $product->price * $item['quantity'];
                
                return [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price
                ];
            });

            $order = Order::create([
                'user_id' => $request->user_id,
                'total' => $total,
                'status' => 'pending'
            ]);

            $order->orderItems()->createMany($items);

            return response()->json($order->load('orderItems.product'), Response::HTTP_CREATED);
        });
    }

    public function show(Order $order)
    {
        return response()->json($order->load('orderItems.product'));
    }

    public function update(Order $order)
    {
        $validated = request()->validate([
            'status' => 'required|in:pending,processing,completed,cancelled'
        ]);

        $order->update($validated);
        return response()->json($order);
    }

    public function destroy(Order $order)
    {
        if ($order->status !== 'pending') {
            return response()->json(['error' => 'Can only delete pending orders'], Response::HTTP_FORBIDDEN);
        }
        
        $order->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function checkout(Request $request)
    {
        $cart = $this->getCart($request);

        if (empty($cart)) {
            return response()->json(['error' => 'Cart is empty'], 400);
        }

        $products = Product::whereIn('id', array_keys($cart))->get()->keyBy('id');

        foreach ($cart as $item) {
            if ($products[$item['product_id']]->stock < $item['quantity']) {
                return response()->json(['error' => "Insufficient stock for {$item['name']}"], 400);
            }
        }

        $order = $request->user()->orders()->create(['status' => 'pending']);
        foreach ($cart as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);

            $products[$item['product_id']]->decrement('stock', $item['quantity']);
        }

        $this->saveCart($request, []);

        return response()->json(['message' => 'Order placed successfully', 'order_id' => $order->id], 201);
    }
}
