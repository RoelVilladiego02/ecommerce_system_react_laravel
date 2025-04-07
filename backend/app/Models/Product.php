<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    // Constants for product status
    public const STATUS_ACTIVE = true;    // Stored as 1
    public const STATUS_INACTIVE = false; // Stored as 0

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image',
        'is_active'
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

    public function isActive(): bool
    {
        return $this->is_active === self::STATUS_ACTIVE;
    }

    public function activate(): void
    {
        $this->is_active = self::STATUS_ACTIVE;
        $this->save();
    }

    public function deactivate(): void
    {
        $this->is_active = self::STATUS_INACTIVE;
        $this->save();
    }
}
