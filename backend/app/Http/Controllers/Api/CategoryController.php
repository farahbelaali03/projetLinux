<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::where('user_id', $request->user()->id)
                               ->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:100',
            'color' => 'nullable|string|max:7',
        ]);

        $category = Category::create([
            'name'    => $request->name,
            'color'   => $request->color ?? '#3498db',
            'user_id' => $request->user()->id,
        ]);

        return response()->json($category, 201);
    }

    public function destroy(Request $request, $id)
    {
        $category = Category::where('id', $id)
                             ->where('user_id', $request->user()->id)
                             ->first();

        if (!$category) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }

        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée ✅']);
    }
}