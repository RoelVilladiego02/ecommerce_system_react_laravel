<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->getCart($request);
        return response()->json(['cart' => $cart], 200);
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::find($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json(['error' => 'Insufficient stock'], 400);
        }

        $cart = $this->getCart($request);
        $cart[$request->product_id] = [
            'product_id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'quantity' => $cart[$request->product_id]['quantity'] ?? 0 + $request->quantity,
        ];

        $this->saveCart($request, $cart);

        return response()->json(['message' => 'Item added to cart', 'cart' => $cart], 200);
    }

    public function removeItem(Request $request, $productId)
    {
        $cart = $this->getCart($request);

        if (!isset($cart[$productId])) {
            return response()->json(['error' => 'Item not found in cart'], 404);
        }

        unset($cart[$productId]);
        $this->saveCart($request, $cart);

        return response()->json(['message' => 'Item removed from cart', 'cart' => $cart], 200);
    }

    public function clear(Request $request)
    {
        $this->saveCart($request, []);
        return response()->json(['message' => 'Cart cleared'], 200);
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
