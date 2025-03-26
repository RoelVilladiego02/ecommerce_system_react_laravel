<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_list_products()
    {
        Product::factory()->count(3)->create();
        
        $response = $this->getJson('/api/products');
        
        $response->assertStatus(200)
                ->assertJsonCount(3);
    }

    public function test_can_create_product()
    {
        $productData = [
            'name' => 'Test Product',
            'description' => 'Test Description',
            'price' => 99.99,
            'stock' => 10,
            'image' => 'test.jpg'
        ];

        $response = $this->postJson('/api/products', $productData);

        $response->assertStatus(201)
                ->assertJsonFragment($productData);
    }

    public function test_can_update_product()
    {
        $product = Product::factory()->create();
        $updateData = ['name' => 'Updated Name'];

        $response = $this->putJson("/api/products/{$product->id}", array_merge(
            $product->toArray(),
            $updateData
        ));

        $response->assertStatus(200)
                ->assertJsonFragment($updateData);
    }

    public function test_cannot_delete_product_with_orders()
    {
        $product = Product::factory()->create();
        OrderItem::factory()->create(['product_id' => $product->id]);

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(403);
    }

    public function test_can_delete_product_without_orders()
    {
        $product = Product::factory()->create();

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(204);
    }
}
