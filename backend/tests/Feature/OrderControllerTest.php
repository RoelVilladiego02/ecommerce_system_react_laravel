<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_orders()
    {
        Order::factory()->count(3)->create();
        
        $response = $this->getJson('/api/orders');
        
        $response->assertStatus(200)
                ->assertJsonCount(3);
    }

    public function test_can_create_order()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 10]);

        $orderData = [
            'user_id' => $user->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $orderData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
    }

    public function test_cannot_create_order_with_insufficient_stock()
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 1]);

        $orderData = [
            'user_id' => $user->id,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2
                ]
            ]
        ];

        $response = $this->postJson('/api/orders', $orderData);

        $response->assertStatus(500);
    }

    public function test_can_update_order_status()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->putJson("/api/orders/{$order->id}", [
            'status' => 'completed'
        ]);

        $response->assertStatus(200)
                ->assertJsonFragment(['status' => 'completed']);
    }
}
