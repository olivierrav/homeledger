// FILENAME: src/db/migrations/20251210200000-add-suggestion-and-label-columns-to-operations.js

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("operations", "suggested_tier_id", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "tiers",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });

        await queryInterface.addColumn("operations", "suggested_budget_id", {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
                model: "budgets",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        });

        await queryInterface.addColumn("operations", "suggestion_confidence", {
            type: Sequelize.DECIMAL(3, 2),
            allowNull: true,
        });

        await queryInterface.addColumn("operations", "suggestion_accepted", {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        });

        await queryInterface.addColumn("operations", "raw_label", {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        await queryInterface.addColumn("operations", "normalized_label", {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("operations", "normalized_label");
        await queryInterface.removeColumn("operations", "raw_label");
        await queryInterface.removeColumn("operations", "suggestion_accepted");
        await queryInterface.removeColumn("operations", "suggestion_confidence");
        await queryInterface.removeColumn("operations", "suggested_budget_id");
        await queryInterface.removeColumn("operations", "suggested_tier_id");
    },
};
