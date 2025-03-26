<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderItemControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_order_items()
    {
        OrderItem::factory()->count(3)->create();
        
        $response = $this->getJson('/api/order-items');
        
        $response->assertStatus(200)
                ->assertJsonCount(3);
    }

    public function test_can_create_order_item()
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['stock' => 10]);

        $orderItemData = [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => $product->price
        ];

        $response = $this->postJson('/api/order-items', $orderItemData);

        $response->assertStatus(201);
        $this->assertDatabaseHas('order_items', $orderItemData);
    }

    public function test_cannot_create_order_item_with_insufficient_stock()
    {
        $order = Order::factory()->create();
        $product = Product::factory()->create(['stock' => 1]);

        $orderItemData = [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => $product->price
        ];

        $response = $this->postJson('/api/order-items', $orderItemData);

        $response->assertStatus(400);
    }

    public function test_can_update_order_item()
    {
        $orderItem = OrderItem::factory()->create(['quantity' => 1]);
        $product = Product::factory()->create(['stock' => 10]);

        $updateData = [
            'order_id' => $orderItem->order_id,
            'product_id' => $orderItem->product_id,
            'quantity' => 2,
            'price' => $orderItem->price
        ];

        $response = $this->putJson("/api/order-items/{$orderItem->id}", $updateData);

        $response->assertStatus(200)
                ->assertJsonFragment(['quantity' => 2]);
    }

    public function test_can_delete_order_item_from_pending_order()
    {
        $order = Order::factory()->create(['status' => 'pending']);
        $orderItem = OrderItem::factory()->create(['order_id' => $order->id]);

        $response = $this->deleteJson("/api/order-items/{$orderItem->id}");

        $response->assertStatus(204);
    }
}
