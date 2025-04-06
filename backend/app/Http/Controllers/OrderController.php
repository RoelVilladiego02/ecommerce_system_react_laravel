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
    public function index(Request $request)
    {
        $query = Order::with(['orderItems.product']);

        // Apply filters
        if ($request->has('date')) {
            $query->filterByDate($request->date);
        }
        if ($request->has(['start_date', 'end_date'])) {
            $query->filterByDateRange($request->start_date, $request->end_date);
        }
        if ($request->has('status')) {
            $query->filterByStatus($request->status);
        }

        // Sort by newest orders first
        $query->latest();

        // Paginate results
        $orders = $query->paginate(15);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
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

    public function show($id)
    {
        $order = Order::with(['orderItems.product'])->findOrFail($id);

        return response()->json([
            'data' => $order,
        ]);
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
        return DB::transaction(function () use ($request) {
            // Validate required fields
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'delivery_address' => 'required|string',
                'contact_number' => 'required|string',
                'payment_method' => 'required|in:cash,gcash,card',
                'items' => 'required|array',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
            ]);

            // Calculate total and validate stock
            $total = 0;
            $items = collect($request->items)->map(function ($item) use (&$total) {
                $product = Product::findOrFail($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$product->name}");
                }
                $product->decrement('stock', $item['quantity']);
                $total += $item['price'] * $item['quantity'];
                return $item;
            });

            // Create order
            $order = Order::create([
                'user_id' => $request->user_id,
                'delivery_address' => $request->delivery_address,
                'contact_number' => $request->contact_number,
                'message' => $request->message ?? null,
                'payment_method' => $request->payment_method,
                'total' => $total,
                'status' => 'pending',
            ]);

            // Create order items
            $order->orderItems()->createMany($items);

            return response()->json([
                'message' => 'Order placed successfully',
                'order_id' => $order->id,
                'data' => $order->load('orderItems.product'),
            ], 201);
        });
    }

    public function getSalesTotal(Request $request)
    {
        $query = Order::query();

        // Apply date range filter
        if ($request->has(['start_date', 'end_date'])) {
            $query->filterByDateRange($request->start_date, $request->end_date);
        }

        $totalSales = $query->sum('total');

        return response()->json([
            'total_sales' => $totalSales,
        ]);
    }
}
