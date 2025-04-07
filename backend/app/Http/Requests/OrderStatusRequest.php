<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Order;

class OrderStatusRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status' => [
                'required',
                'string',
                'in:' . implode(',', [
                    Order::STATUS_PENDING,
                    Order::STATUS_COMPLETED,
                ])
            ]
        ];
    }
}
