<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('delivery_address');
            $table->string('contact_number');
            $table->text('message')->nullable();
            $table->string('payment_method')->default('cash');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['delivery_address', 'contact_number', 'message', 'payment_method']);
        });
    }
};
