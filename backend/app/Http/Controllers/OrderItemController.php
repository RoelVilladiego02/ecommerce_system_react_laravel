<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\Product;
use App\Http\Requests\OrderItemRequest;
use Illuminate\Http\Response;

class OrderItemController extends Controller
{
    public function index()
    {
        return response()->json(OrderItem::with(['product', 'order'])->get());
    }

    public function store(OrderItemRequest $request)
    {
        $product = Product::findOrFail($request->product_id);
        
        if ($product->stock < $request->quantity) {
            return response()->json([
                'error' => 'Insufficient stock'
            ], Response::HTTP_BAD_REQUEST);
        }

        $product->decrement('stock', $request->quantity);
        
        $orderItem = OrderItem::create($request->validated());
        return response()->json($orderItem, Response::HTTP_CREATED);
    }

    public function show($orderId)
    {
        $orderItems = OrderItem::with(['product', 'order'])
            ->where('order_id', $orderId)
            ->get();

        if ($orderItems->isEmpty()) {
            return response()->json([
                'error' => 'Order items not found'
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'data' => $orderItems,
            'total' => $orderItems->sum(function ($item) {
                return $item->quantity * $item->price;
            })
        ]);
    }

    public function update(OrderItemRequest $request, OrderItem $orderItem)
    {
        $product = Product::findOrFail($orderItem->product_id);
        
        // Restore old quantity and check if new quantity is available
        $product->increment('stock', $orderItem->quantity);
        if ($product->stock < $request->quantity) {
            $product->decrement('stock', $orderItem->quantity);
            return response()->json([
                'error' => 'Insufficient stock'
            ], Response::HTTP_BAD_REQUEST);
        }
        
        $product->decrement('stock', $request->quantity);
        $orderItem->update($request->validated());
        
        return response()->json($orderItem);
    }

    public function destroy(OrderItem $orderItem)
    {
        if ($orderItem->order->status !== 'pending') {
            return response()->json([
                'error' => 'Can only modify pending orders'
            ], Response::HTTP_FORBIDDEN);
        }

        $product = Product::findOrFail($orderItem->product_id);
        $product->increment('stock', $orderItem->quantity);
        
        $orderItem->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
