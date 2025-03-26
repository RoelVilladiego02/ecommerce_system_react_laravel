<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_register_employee_with_admin_key()
    {
        $response = $this->withHeaders([
            'Admin-Key' => config('auth.admin_key'),
        ])->postJson('/api/register/employee', [
            'name' => 'Test Employee',
            'email' => 'employee@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(201);
        $this->assertEquals('employee', User::first()->role);
    }

    public function test_cannot_register_employee_without_admin_key()
    {
        $response = $this->postJson('/api/register/employee', [
            'name' => 'Test Employee',
            'email' => 'employee@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123'
        ]);

        $response->assertStatus(403);
    }
}
