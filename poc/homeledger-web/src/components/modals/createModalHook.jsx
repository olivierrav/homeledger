// FILENAME: src/components/modals/createModalHook.js
/* eslint-disable react-refresh/only-export-components */

import { useState, useCallback } from "react";

/**
 * Moteur générique pour créer des modales "promise-based".
 *
 * @param {React.ComponentType} ModalComponent
 *   Composant qui reçoit les props:
 *   - isVisible: bool
 *   - options: objet passé à l'ouverture
 *   - onResolve(result): à appeler quand l'utilisateur valide
 *   - onCancel(): à appeler quand l'utilisateur annule/ferme
 *
 * @returns useModal hook
 *   const [openModal, ModalElement] = useXXXModal();
 *   const result = await openModal(options);
 */
export function createModalHook(ModalComponent) {
    return function useModal() {
        const [isVisible, setIsVisible] = useState(false);
        const [options, setOptions] = useState(null);
        const [resolver, setResolver] = useState(null);

        const openModal = useCallback((opts = {}) => {
            setIsVisible(true);
            setOptions(opts || {});
            return new Promise((resolve) => {
                // on stocke le resolve dans le state pour l'utiliser plus tard
                setResolver(() => resolve);
            });
        }, []);

        const handleResolve = useCallback(
            (result) => {
                if (resolver) {
                    resolver(result);
                }
                setIsVisible(false);
                setResolver(null);
            },
            [resolver]
        );

        const handleCancel = useCallback(() => {
            if (resolver) {
                // convention: null = annulé
                resolver(null);
            }
            setIsVisible(false);
            setResolver(null);
        }, [resolver]);

        const element = (
            <ModalComponent
                isVisible={isVisible}
                options={options || {}}
                onResolve={handleResolve}
                onCancel={handleCancel}
            />
        );

        return [openModal, element];
    };
}