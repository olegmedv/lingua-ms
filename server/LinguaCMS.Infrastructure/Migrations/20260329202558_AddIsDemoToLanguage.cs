using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LinguaCMS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDemoToLanguage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsDemo",
                table: "Languages",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDemo",
                table: "Languages");
        }
    }
}
