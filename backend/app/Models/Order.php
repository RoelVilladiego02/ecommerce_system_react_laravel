<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_COMPLETED = 'completed';

    public const VALID_STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_COMPLETED
    ];

    protected $fillable = [
        'user_id',
        'total',
        'status',
        'delivery_address',
        'contact_number',
        'message',
        'payment_method'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_items')
            ->withPivot('quantity', 'price');
    }

    public function scopeFilterByDate($query, $date)
    {
        return $query->whereDate('created_at', $date);
    }

    public function scopeFilterByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeFilterByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }
}
