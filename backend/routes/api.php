<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderItemController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CartController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes (no auth required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/register/employee', [AuthController::class, 'registerEmployee']);
Route::post('/login', [AuthController::class, 'login']);

// Routes requiring authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Employee-specific routes
    Route::middleware('role:employee')->group(function () {
        Route::apiResource('products', ProductController::class)->except(['index']);
        
        // Order management routes
        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/{order}', [OrderController::class, 'show']);
            Route::put('/{order}/status', [OrderController::class, 'updateStatus'])
                ->where('order', '[0-9]+');
            Route::get('/sales/total', [OrderController::class, 'getSalesTotal']);
            Route::get('/{order}/items', [OrderItemController::class, 'show'])
                ->where('order', '[0-9]+');
        });
    });
    
    // Routes accessible by both employees and customers
    Route::get('/products', [ProductController::class, 'index']);
    
    // Customer-specific routes
    Route::middleware('role:customer')->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        
        // Cart routes
        Route::get('/cart', [CartController::class, 'show']);
        Route::post('/cart', [CartController::class, 'addItem']);
        Route::put('/cart/{product}', [CartController::class, 'updateItem']); // New update endpoint
        Route::delete('/cart/{product}', [CartController::class, 'removeItem']);
        Route::post('/cart/clear', [CartController::class, 'clear']);
        Route::post('/checkout', [OrderController::class, 'checkout']);
        
        // Customer order routes
        Route::prefix('my-orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/{order}', [OrderController::class, 'show'])
                ->where('order', '[0-9]+');
            Route::get('/{order}/items', [OrderItemController::class, 'show'])
                ->where('order', '[0-9]+');
        });
    });
});