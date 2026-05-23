using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LinguaCMS.Data.Migrations
{
    /// <inheritdoc />
    public partial class SnakeCaseRename : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Exercises_Lessons_LessonId",
                table: "Exercises");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonProgress_Lessons_LessonId",
                table: "LessonProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_LessonProgress_Users_UserId",
                table: "LessonProgress");

            migrationBuilder.DropForeignKey(
                name: "FK_Lessons_Languages_LanguageId",
                table: "Lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_UserStats_Users_UserId",
                table: "UserStats");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Lessons",
                table: "Lessons");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Languages",
                table: "Languages");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Exercises",
                table: "Exercises");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserStats",
                table: "UserStats");

            migrationBuilder.DropPrimaryKey(
                name: "PK_LessonProgress",
                table: "LessonProgress");

            migrationBuilder.RenameTable(
                name: "Users",
                newName: "users");

            migrationBuilder.RenameTable(
                name: "Lessons",
                newName: "lessons");

            migrationBuilder.RenameTable(
                name: "Languages",
                newName: "languages");

            migrationBuilder.RenameTable(
                name: "Exercises",
                newName: "exercises");

            migrationBuilder.RenameTable(
                name: "UserStats",
                newName: "user_stats");

            migrationBuilder.RenameTable(
                name: "LessonProgress",
                newName: "lesson_progress");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "users",
                newName: "role");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "users",
                newName: "email");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "users",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "users",
                newName: "password_hash");

            migrationBuilder.RenameColumn(
                name: "DisplayName",
                table: "users",
                newName: "display_name");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "users",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Users_Email",
                table: "users",
                newName: "ix_users_email");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "lessons",
                newName: "title");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "lessons",
                newName: "order");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "lessons",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "lessons",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "PassThreshold",
                table: "lessons",
                newName: "pass_threshold");

            migrationBuilder.RenameColumn(
                name: "LanguageId",
                table: "lessons",
                newName: "language_id");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "lessons",
                newName: "created_at");

            migrationBuilder.RenameIndex(
                name: "IX_Lessons_LanguageId",
                table: "lessons",
                newName: "ix_lessons_language_id");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "languages",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "languages",
                newName: "description");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "languages",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "IsPublished",
                table: "languages",
                newName: "is_published");

            migrationBuilder.RenameColumn(
                name: "IsDemo",
                table: "languages",
                newName: "is_demo");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "languages",
                newName: "image_url");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "languages",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "exercises",
                newName: "type");

            migrationBuilder.RenameColumn(
                name: "Order",
                table: "exercises",
                newName: "order");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "exercises",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "LessonId",
                table: "exercises",
                newName: "lesson_id");

            migrationBuilder.RenameColumn(
                name: "ContentJson",
                table: "exercises",
                newName: "content_json");

            migrationBuilder.RenameColumn(
                name: "AudioUrl",
                table: "exercises",
                newName: "audio_url");

            migrationBuilder.RenameIndex(
                name: "IX_Exercises_LessonId",
                table: "exercises",
                newName: "ix_exercises_lesson_id");

            migrationBuilder.RenameColumn(
                name: "TotalXp",
                table: "user_stats",
                newName: "total_xp");

            migrationBuilder.RenameColumn(
                name: "LongestStreak",
                table: "user_stats",
                newName: "longest_streak");

            migrationBuilder.RenameColumn(
                name: "LastActivityDate",
                table: "user_stats",
                newName: "last_activity_date");

            migrationBuilder.RenameColumn(
                name: "CurrentStreak",
                table: "user_stats",
                newName: "current_streak");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "user_stats",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "Score",
                table: "lesson_progress",
                newName: "score");

            migrationBuilder.RenameColumn(
                name: "Completed",
                table: "lesson_progress",
                newName: "completed");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "lesson_progress",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "XpEarned",
                table: "lesson_progress",
                newName: "xp_earned");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "lesson_progress",
                newName: "user_id");

            migrationBuilder.RenameColumn(
                name: "LessonId",
                table: "lesson_progress",
                newName: "lesson_id");

            migrationBuilder.RenameColumn(
                name: "CompletedAt",
                table: "lesson_progress",
                newName: "completed_at");

            migrationBuilder.RenameIndex(
                name: "IX_LessonProgress_UserId",
                table: "lesson_progress",
                newName: "ix_lesson_progress_user_id");

            migrationBuilder.RenameIndex(
                name: "IX_LessonProgress_LessonId",
                table: "lesson_progress",
                newName: "ix_lesson_progress_lesson_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_users",
                table: "users",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_lessons",
                table: "lessons",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_languages",
                table: "languages",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_exercises",
                table: "exercises",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_user_stats",
                table: "user_stats",
                column: "user_id");

            migrationBuilder.AddPrimaryKey(
                name: "pk_lesson_progress",
                table: "lesson_progress",
                column: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_exercises_lessons_lesson_id",
                table: "exercises",
                column: "lesson_id",
                principalTable: "lessons",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_lesson_progress_lessons_lesson_id",
                table: "lesson_progress",
                column: "lesson_id",
                principalTable: "lessons",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_lesson_progress_users_user_id",
                table: "lesson_progress",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_lessons_languages_language_id",
                table: "lessons",
                column: "language_id",
                principalTable: "languages",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_user_stats_users_user_id",
                table: "user_stats",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_exercises_lessons_lesson_id",
                table: "exercises");

            migrationBuilder.DropForeignKey(
                name: "fk_lesson_progress_lessons_lesson_id",
                table: "lesson_progress");

            migrationBuilder.DropForeignKey(
                name: "fk_lesson_progress_users_user_id",
                table: "lesson_progress");

            migrationBuilder.DropForeignKey(
                name: "fk_lessons_languages_language_id",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "fk_user_stats_users_user_id",
                table: "user_stats");

            migrationBuilder.DropPrimaryKey(
                name: "pk_users",
                table: "users");

            migrationBuilder.DropPrimaryKey(
                name: "pk_lessons",
                table: "lessons");

            migrationBuilder.DropPrimaryKey(
                name: "pk_languages",
                table: "languages");

            migrationBuilder.DropPrimaryKey(
                name: "pk_exercises",
                table: "exercises");

            migrationBuilder.DropPrimaryKey(
                name: "pk_user_stats",
                table: "user_stats");

            migrationBuilder.DropPrimaryKey(
                name: "pk_lesson_progress",
                table: "lesson_progress");

            migrationBuilder.RenameTable(
                name: "users",
                newName: "Users");

            migrationBuilder.RenameTable(
                name: "lessons",
                newName: "Lessons");

            migrationBuilder.RenameTable(
                name: "languages",
                newName: "Languages");

            migrationBuilder.RenameTable(
                name: "exercises",
                newName: "Exercises");

            migrationBuilder.RenameTable(
                name: "user_stats",
                newName: "UserStats");

            migrationBuilder.RenameTable(
                name: "lesson_progress",
                newName: "LessonProgress");

            migrationBuilder.RenameColumn(
                name: "role",
                table: "Users",
                newName: "Role");

            migrationBuilder.RenameColumn(
                name: "email",
                table: "Users",
                newName: "Email");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Users",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "password_hash",
                table: "Users",
                newName: "PasswordHash");

            migrationBuilder.RenameColumn(
                name: "display_name",
                table: "Users",
                newName: "DisplayName");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "ix_users_email",
                table: "Users",
                newName: "IX_Users_Email");

            migrationBuilder.RenameColumn(
                name: "title",
                table: "Lessons",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "order",
                table: "Lessons",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Lessons",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Lessons",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "pass_threshold",
                table: "Lessons",
                newName: "PassThreshold");

            migrationBuilder.RenameColumn(
                name: "language_id",
                table: "Lessons",
                newName: "LanguageId");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Lessons",
                newName: "CreatedAt");

            migrationBuilder.RenameIndex(
                name: "ix_lessons_language_id",
                table: "Lessons",
                newName: "IX_Lessons_LanguageId");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Languages",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "description",
                table: "Languages",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Languages",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "is_published",
                table: "Languages",
                newName: "IsPublished");

            migrationBuilder.RenameColumn(
                name: "is_demo",
                table: "Languages",
                newName: "IsDemo");

            migrationBuilder.RenameColumn(
                name: "image_url",
                table: "Languages",
                newName: "ImageUrl");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "Languages",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "type",
                table: "Exercises",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "order",
                table: "Exercises",
                newName: "Order");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Exercises",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "lesson_id",
                table: "Exercises",
                newName: "LessonId");

            migrationBuilder.RenameColumn(
                name: "content_json",
                table: "Exercises",
                newName: "ContentJson");

            migrationBuilder.RenameColumn(
                name: "audio_url",
                table: "Exercises",
                newName: "AudioUrl");

            migrationBuilder.RenameIndex(
                name: "ix_exercises_lesson_id",
                table: "Exercises",
                newName: "IX_Exercises_LessonId");

            migrationBuilder.RenameColumn(
                name: "total_xp",
                table: "UserStats",
                newName: "TotalXp");

            migrationBuilder.RenameColumn(
                name: "longest_streak",
                table: "UserStats",
                newName: "LongestStreak");

            migrationBuilder.RenameColumn(
                name: "last_activity_date",
                table: "UserStats",
                newName: "LastActivityDate");

            migrationBuilder.RenameColumn(
                name: "current_streak",
                table: "UserStats",
                newName: "CurrentStreak");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "UserStats",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "score",
                table: "LessonProgress",
                newName: "Score");

            migrationBuilder.RenameColumn(
                name: "completed",
                table: "LessonProgress",
                newName: "Completed");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "LessonProgress",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "xp_earned",
                table: "LessonProgress",
                newName: "XpEarned");

            migrationBuilder.RenameColumn(
                name: "user_id",
                table: "LessonProgress",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "lesson_id",
                table: "LessonProgress",
                newName: "LessonId");

            migrationBuilder.RenameColumn(
                name: "completed_at",
                table: "LessonProgress",
                newName: "CompletedAt");

            migrationBuilder.RenameIndex(
                name: "ix_lesson_progress_user_id",
                table: "LessonProgress",
                newName: "IX_LessonProgress_UserId");

            migrationBuilder.RenameIndex(
                name: "ix_lesson_progress_lesson_id",
                table: "LessonProgress",
                newName: "IX_LessonProgress_LessonId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Lessons",
                table: "Lessons",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Languages",
                table: "Languages",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Exercises",
                table: "Exercises",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserStats",
                table: "UserStats",
                column: "UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_LessonProgress",
                table: "LessonProgress",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Exercises_Lessons_LessonId",
                table: "Exercises",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonProgress_Lessons_LessonId",
                table: "LessonProgress",
                column: "LessonId",
                principalTable: "Lessons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LessonProgress_Users_UserId",
                table: "LessonProgress",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Lessons_Languages_LanguageId",
                table: "Lessons",
                column: "LanguageId",
                principalTable: "Languages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserStats_Users_UserId",
                table: "UserStats",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
