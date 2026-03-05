// FILENAME: src/db/migrations/20251210190000-add-imported-to-operations.js

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("operations", "imported", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("operations", "imported");
    },
};
