<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();
        
        // Debug log for user context
        Log::info('Fetching products for user:', [
            'user_id' => $request->user()?->id,
            'role' => $request->user()?->role,
            'is_authenticated' => $request->user() !== null
        ]);

        // If not an employee, only show active products
        if (!$request->user() || $request->user()->role !== 'employee') {
            $query->where('is_active', Product::STATUS_ACTIVE);
            Log::info('Filtering active products only');
        }

        // Debug log for query before execution
        Log::info('Product query:', [
            'sql' => $query->toSql(),
            'bindings' => $query->getBindings()
        ]);

        $products = $query->paginate(10);

        // Debug log for results
        Log::info('Query results:', [
            'total_products' => $products->total(),
            'products_in_page' => count($products->items()),
            'has_more_pages' => $products->hasMorePages()
        ]);

        return response()->json([
            'data' => $products->items(),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function store(ProductRequest $request)
    {
        $product = Product::create($request->validated());
        return response()->json($product, Response::HTTP_CREATED);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(ProductRequest $request, Product $product)
    {
        $product->update($request->validated());
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        if ($product->orderItems()->exists()) {
            return response()->json(['error' => 'Cannot delete product with existing orders'], Response::HTTP_FORBIDDEN);
        }
        
        $product->delete();
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}
