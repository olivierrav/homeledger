"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Renommer la colonne et changer le type de DATEONLY vers TIMESTAMP
        await queryInterface.renameColumn("operations", "booking_date", "date_time");
        await queryInterface.changeColumn("operations", "date_time", {
            type: Sequelize.DATE, // TIMESTAMP WITH TIME ZONE
            allowNull: false
        });

        // Mettre à jour l'index
        await queryInterface.removeIndex("operations", "idx_operations_account_date_created");
        await queryInterface.addIndex("operations", ["account_id", "date_time"], {
            name: "idx_operations_account_datetime"
        });
    },

    async down(queryInterface, Sequelize) {
        // Restaurer l'ancien index
        await queryInterface.removeIndex("operations", "idx_operations_account_datetime");
        await queryInterface.addIndex("operations", ["account_id", "date_time", "created_at"], {
            name: "idx_operations_account_date_created"
        });

        // Renommer et changer le type
        await queryInterface.changeColumn("operations", "date_time", {
            type: Sequelize.DATEONLY,
            allowNull: false
        });
        await queryInterface.renameColumn("operations", "date_time", "booking_date");
    }
};
