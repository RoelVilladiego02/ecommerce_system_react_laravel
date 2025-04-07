<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->getCart($request) ?? [];
        return response()->json(['cart' => $cart], 200);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient stock'
            ], 400);
        }

        $cart = $this->getCart($request);
        
        if (isset($cart[$request->product_id])) {
            $cart[$request->product_id]['quantity'] += $request->quantity;
        } else {
            $cart[$request->product_id] = [
                'product_id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'image' => $product->image,
                'quantity' => $request->quantity,
                'stock' => $product->stock, // Add stock info to cart item
            ];
        }

        $this->saveCart($request, $cart);

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart',
            'cart' => array_values($cart) // Convert to indexed array
        ]);
    }

    public function updateItem(Request $request, $productId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($productId);
        $cart = $this->getCart($request);

        if (!isset($cart[$productId])) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart'
            ], 404);
        }

        // Check if requested quantity is within stock limits
        if ($product->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot exceed available stock'
            ], 400);
        }

        // Update cart item with new quantity and refresh product data
        $cart[$productId]['quantity'] = $request->quantity;
        $cart[$productId]['stock'] = $product->stock; // Update stock info

        $this->saveCart($request, $cart);

        return response()->json([
            'success' => true,
            'message' => 'Cart updated successfully',
            'cart' => array_values($cart) // Convert to indexed array
        ]);
    }

    public function removeItem(Request $request, $productId)
    {
        $cart = $this->getCart($request);

        if (!isset($cart[$productId])) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found in cart'
            ], 404);
        }

        unset($cart[$productId]);
        $this->saveCart($request, $cart);

        return response()->json([
            'success' => true, 
            'message' => 'Item removed from cart', 
            'cart' => array_values($cart)
        ], 200);
    }

    public function clear(Request $request)
    {
        try {
            if ($request->user()) {
                $request->user()->update(['cart' => null]);
            } else {
                session()->forget('cart');
            }
            
            return response()->json(['success' => true, 'message' => 'Cart cleared successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart'
            ], 500);
        }
    }

    private function getCart(Request $request)
    {
        if ($request->user()) {
            return $request->user()->cart ?? [];
        }

        return session('cart', []);
    }

    private function saveCart(Request $request, array $cart)
    {
        if ($request->user()) {
            $request->user()->update(['cart' => $cart]);
        } else {
            session(['cart' => $cart]);
        }
    }
}