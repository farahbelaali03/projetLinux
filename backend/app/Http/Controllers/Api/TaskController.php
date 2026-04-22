<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $tasks = Task::where('user_id', $request->user()->id)
                     ->orWhere('assigned_to', $request->user()->id)
                     ->with('category')
                     ->get();

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'in:pending,in_progress,completed',
            'priority'    => 'in:low,medium,high',
            'due_date'    => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $task = Task::create([
            'title'       => $request->title,
            'description' => $request->description,
            'status'      => $request->status ?? 'pending',
            'priority'    => $request->priority ?? 'medium',
            'due_date'    => $request->due_date,
            'category_id' => $request->category_id,
            'assigned_to' => $request->assigned_to,
            'user_id'     => $request->user()->id,
        ]);

        return response()->json($task, 201);
    }

    public function show(Request $request, $id)
    {
        $task = Task::where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->first();

        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->first();

        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }

        $task->update($request->all());

        return response()->json($task);
    }

    public function destroy(Request $request, $id)
    {
        $task = Task::where('id', $id)
                    ->where('user_id', $request->user()->id)
                    ->first();

        if (!$task) {
            return response()->json(['message' => 'Tâche non trouvée'], 404);
        }

        $task->delete();

        return response()->json(['message' => 'Tâche supprimée ✅']);
    }
}