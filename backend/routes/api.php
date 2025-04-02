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

Route::post('/register', [AuthController::class, 'register']);
Route::post('/register/employee', [AuthController::class, 'registerEmployee']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    // Get authenticated user route
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Employee routes
    Route::middleware('role:employee')->group(function () {
        Route::apiResource('products', ProductController::class);
        Route::get('/orders/monitor', [OrderController::class, 'monitor']);
    });

    Route::middleware(['auth:sanctum', 'role:employee'])->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::get('/orders/sales/total', [OrderController::class, 'getSalesTotal']);
    });
    
    // Customer routes
    Route::middleware('role:customer')->group(function () {
        Route::get('/products', [ProductController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
    });

    Route::middleware('role:customer')->group(function () {
        Route::get('/cart', [CartController::class, 'show']);
        Route::post('/cart', [CartController::class, 'addItem']);
        Route::delete('/cart/{product}', [CartController::class, 'removeItem']);
        Route::post('/checkout', [OrderController::class, 'checkout']);
    });
});