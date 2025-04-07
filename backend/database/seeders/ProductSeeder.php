<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Create 15 active products
        Product::factory()->count(15)->state([
            'is_active' => true
        ])->create();

        // Create 5 inactive products
        Product::factory()->count(5)->state([
            'is_active' => false
        ])->create();
    }
}
