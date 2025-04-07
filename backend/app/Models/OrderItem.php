<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price'
    ];

    protected $appends = ['subtotal'];

    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->price;
    }

    // One OrderItem belongs to one Product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // One OrderItem belongs to one Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
