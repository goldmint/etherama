using Microsoft.EntityFrameworkCore.Migrations;
using System;
using System.Collections.Generic;

namespace Etherama.DAL.Migrations
{
    public partial class m32 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "description_en",
                table: "er_token",
                maxLength: 1024,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "description_ru",
                table: "er_token",
                maxLength: 1024,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "description_en",
                table: "er_token");

            migrationBuilder.DropColumn(
                name: "description_ru",
                table: "er_token");
        }
    }
}
