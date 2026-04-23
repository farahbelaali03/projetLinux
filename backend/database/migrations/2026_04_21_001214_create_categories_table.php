<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     *  Crée la table "categories"
     *   Cette migration DOIT s'exécuter APRÈS users
     *      (car elle a une FK vers users)
     * Exécutée avec : php artisan migrate
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {

            //  Clé primaire
            $table->id();

            //  Nom de la catégorie : VARCHAR(100) NOT NULL
            $table->string('name', 100);

            //  Couleur hex : VARCHAR(7) DEFAULT '#3498db'
            $table->string('color', 7)->default('#3498db');

            //  Clé étrangère vers users(id)
            //    INT UNSIGNED NOT NULL
            //    ON DELETE CASCADE → si l'utilisateur est supprimé,
            //    ses catégories sont supprimées aussi
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     *  Supprime la table "categories"
     * Exécutée avec : php artisan migrate:rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
