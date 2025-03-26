<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image'
    ];

    // One Product can have many OrderItems
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Products belong to many Orders through OrderItems table
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_items')
            ->withPivot('quantity', 'price');
    }
}
