<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        Order::factory()
            ->count(15)
            ->create()
            ->each(function ($order) {
                $products = Product::inRandomOrder()->take(rand(1, 5))->get();
                
                foreach ($products as $product) {
                    $quantity = rand(1, 3);
                    $order->orderItems()->create([
                        'product_id' => $product->id,
                        'quantity' => $quantity,
                        'price' => $product->price
                    ]);
                    $product->decrement('stock', $quantity);
                }
                
                $order->update([
                    'total' => $order->orderItems->sum(function ($item) {
                        return $item->price * $item->quantity;
                    })
                ]);
            });
    }
}
