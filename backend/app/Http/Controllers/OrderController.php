<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Http\Requests\OrderRequest;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

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
}
