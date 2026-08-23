using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Atlas.Apply.Migrations
{
    /// <inheritdoc />
    public partial class AddStructuredProfiles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CertificationsJson",
                table: "Profiles",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EducationJson",
                table: "Profiles",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExperienceJson",
                table: "Profiles",
                type: "jsonb",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImportedResumeContentType",
                table: "Profiles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImportedResumeFileName",
                table: "Profiles",
                type: "character varying(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImportedResumeText",
                table: "Profiles",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ImportedResumeUtc",
                table: "Profiles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Profiles",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "Profiles",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageContentType",
                table: "Profiles",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageFileName",
                table: "Profiles",
                type: "character varying(260)",
                maxLength: 260,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImagePath",
                table: "Profiles",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectsJson",
                table: "Profiles",
                type: "jsonb",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CertificationsJson",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "EducationJson",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ExperienceJson",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ImportedResumeContentType",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ImportedResumeFileName",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ImportedResumeText",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ImportedResumeUtc",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileImageContentType",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileImageFileName",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProfileImagePath",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "ProjectsJson",
                table: "Profiles");
        }
    }
}
