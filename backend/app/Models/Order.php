<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total',
        'status'
    ];

    // One Order belongs to one User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // One Order can have many OrderItems
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Orders belong to many Products through OrderItems table
    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price');
    }
}
