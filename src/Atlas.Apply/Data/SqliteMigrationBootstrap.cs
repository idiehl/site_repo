using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Atlas.Apply.Data;

internal static class SqliteMigrationBootstrap
{
    private const string InitialMigrationId = "20260404145151_InitialApply";
    private const string StructuredProfilesMigrationId = "20260416174138_AddStructuredProfiles";
    private const string ProductVersion = "10.0.5";

    public static void EnsureMigrated(ApplyDbContext db, ILogger logger)
    {
        SeedInitialMigrationHistoryIfNeeded(db, logger);
        ApplyStructuredProfileUpgrade(db, logger);
    }

    private static void SeedInitialMigrationHistoryIfNeeded(ApplyDbContext db, ILogger logger)
    {
        var connection = db.Database.GetDbConnection();
        if (connection is not SqliteConnection)
        {
            return;
        }

        var shouldClose = connection.State != System.Data.ConnectionState.Open;
        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            if (TableExists(connection, "__EFMigrationsHistory"))
            {
                return;
            }

            if (!TableExists(connection, "Users") || !TableExists(connection, "Profiles"))
            {
                return;
            }

            logger.LogInformation("Seeding SQLite migration history for Atlas.Apply legacy database.");
            db.Database.ExecuteSqlRaw(
                """
                CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
                    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
                    "ProductVersion" TEXT NOT NULL
                );
                """);

            db.Database.ExecuteSqlRaw(
                """
                INSERT OR IGNORE INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ({0}, {1});
                """,
                InitialMigrationId,
                ProductVersion);
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }

    private static bool TableExists(System.Data.Common.DbConnection connection, string tableName)
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT 1
            FROM sqlite_master
            WHERE type = 'table' AND name = $name
            LIMIT 1
            """;

        var parameter = command.CreateParameter();
        parameter.ParameterName = "$name";
        parameter.Value = tableName;
        command.Parameters.Add(parameter);
        return command.ExecuteScalar() is not null;
    }

    private static void ApplyStructuredProfileUpgrade(ApplyDbContext db, ILogger logger)
    {
        var connection = db.Database.GetDbConnection();
        if (connection is not SqliteConnection)
        {
            return;
        }

        var shouldClose = connection.State != System.Data.ConnectionState.Open;
        if (shouldClose)
        {
            connection.Open();
        }

        try
        {
            if (!TableExists(connection, "Profiles"))
            {
                return;
            }

            var existingColumns = GetColumnNames(connection, "Profiles");
            var commands = new List<string>();
            AddColumnIfMissing(existingColumns, commands, "PhoneNumber", """ALTER TABLE "Profiles" ADD COLUMN "PhoneNumber" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "PortfolioUrl", """ALTER TABLE "Profiles" ADD COLUMN "PortfolioUrl" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ProfileImagePath", """ALTER TABLE "Profiles" ADD COLUMN "ProfileImagePath" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ProfileImageFileName", """ALTER TABLE "Profiles" ADD COLUMN "ProfileImageFileName" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ProfileImageContentType", """ALTER TABLE "Profiles" ADD COLUMN "ProfileImageContentType" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ImportedResumeFileName", """ALTER TABLE "Profiles" ADD COLUMN "ImportedResumeFileName" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ImportedResumeContentType", """ALTER TABLE "Profiles" ADD COLUMN "ImportedResumeContentType" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ImportedResumeText", """ALTER TABLE "Profiles" ADD COLUMN "ImportedResumeText" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ImportedResumeUtc", """ALTER TABLE "Profiles" ADD COLUMN "ImportedResumeUtc" TEXT NULL;""");
            AddColumnIfMissing(existingColumns, commands, "ExperienceJson", """ALTER TABLE "Profiles" ADD COLUMN "ExperienceJson" TEXT NOT NULL DEFAULT '[]';""");
            AddColumnIfMissing(existingColumns, commands, "EducationJson", """ALTER TABLE "Profiles" ADD COLUMN "EducationJson" TEXT NOT NULL DEFAULT '[]';""");
            AddColumnIfMissing(existingColumns, commands, "ProjectsJson", """ALTER TABLE "Profiles" ADD COLUMN "ProjectsJson" TEXT NOT NULL DEFAULT '[]';""");
            AddColumnIfMissing(existingColumns, commands, "CertificationsJson", """ALTER TABLE "Profiles" ADD COLUMN "CertificationsJson" TEXT NOT NULL DEFAULT '[]';""");
            AddColumnIfMissing(existingColumns, commands, "SectionDocumentsJson", """ALTER TABLE "Profiles" ADD COLUMN "SectionDocumentsJson" TEXT NOT NULL DEFAULT '{}';""");

            if (commands.Count > 0)
            {
                logger.LogInformation("Applying SQLite structured profile schema upgrade.");
                foreach (var commandText in commands)
                {
                    db.Database.ExecuteSqlRaw(commandText);
                }
            }

            db.Database.ExecuteSqlRaw(
                """
                INSERT OR IGNORE INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ({0}, {1});
                """,
                StructuredProfilesMigrationId,
                ProductVersion);
        }
        finally
        {
            if (shouldClose)
            {
                connection.Close();
            }
        }
    }

    private static HashSet<string> GetColumnNames(System.Data.Common.DbConnection connection, string tableName)
    {
        using var command = connection.CreateCommand();
        command.CommandText = $"""PRAGMA table_info("{tableName}")""";
        using var reader = command.ExecuteReader();
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        while (reader.Read())
        {
            columns.Add(reader.GetString(1));
        }

        return columns;
    }

    private static void AddColumnIfMissing(HashSet<string> existingColumns, List<string> commands, string columnName, string commandText)
    {
        if (!existingColumns.Contains(columnName))
        {
            commands.Add(commandText);
            existingColumns.Add(columnName);
        }
    }
}
