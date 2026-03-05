"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // Create categories table
        await queryInterface.createTable("categories", {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                defaultValue: Sequelize.literal("gen_random_uuid()")
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id"
                },
                onDelete: "CASCADE"
            },
            name: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            color: {
                type: Sequelize.STRING(7),
                allowNull: false,
                defaultValue: "#1890ff"
            },
            icon_key: {
                type: Sequelize.STRING(50),
                allowNull: true
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("now()")
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("now()")
            }
        });

        await queryInterface.addIndex("categories", ["user_id"], {
            name: "idx_categories_user_id"
        });

        // Add category_id to operations
        await queryInterface.addColumn("operations", "category_id", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "categories",
                key: "id"
            },
            onDelete: "SET NULL"
        });

        await queryInterface.addIndex("operations", ["category_id"], {
            name: "idx_operations_category_id"
        });

        // Replace budget_id with category_id on tiers
        await queryInterface.addColumn("tiers", "category_id", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "categories",
                key: "id"
            },
            onDelete: "SET NULL"
        });

        await queryInterface.addIndex("tiers", ["category_id"], {
            name: "idx_tiers_category_id"
        });

        // Remove budget_id from tiers (no longer needed)
        await queryInterface.removeColumn("tiers", "budget_id");
    },

    async down(queryInterface, Sequelize) {
        // Restore budget_id on tiers
        await queryInterface.addColumn("tiers", "budget_id", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "budgets",
                key: "id"
            },
            onDelete: "SET NULL"
        });

        // Remove category_id from tiers
        await queryInterface.removeIndex("tiers", "idx_tiers_category_id");
        await queryInterface.removeColumn("tiers", "category_id");

        // Remove category_id from operations
        await queryInterface.removeIndex("operations", "idx_operations_category_id");
        await queryInterface.removeColumn("operations", "category_id");

        // Drop categories table
        await queryInterface.dropTable("categories");
    }
};
