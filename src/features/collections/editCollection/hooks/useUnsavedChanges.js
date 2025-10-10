import { useState, useCallback } from 'react';
import useEditCollectionStore from '../../state/editCollectionStore';

/**
 * useUnsavedChanges
 *
 * Hook for managing unsaved changes detection and warning dialog.
 * Provides interface for detecting when user has unsaved changes and
 * showing a warning dialog when attempting to navigate away.
 *
 * @returns {Object} Unsaved changes state and handlers
 * @property {boolean} hasUnsavedChanges - True if user has unsaved changes
 * @property {boolean} showWarning - True if warning dialog should be visible
 * @property {Function} handleNavigationAttempt - Call when user attempts to navigate away
 * @property {Function} handleKeepEditing - Call when user chooses to keep editing
 * @property {Function} handleDiscardChanges - Call when user confirms discarding changes
 *
 * @example
 * const {
 *   hasUnsavedChanges,
 *   showWarning,
 *   handleNavigationAttempt,
 *   handleKeepEditing,
 *   handleDiscardChanges
 * } = useUnsavedChanges();
 *
 * // In component when cancel button clicked:
 * const onCancel = () => {
 *   if (hasUnsavedChanges) {
 *     handleNavigationAttempt();
 *   } else {
 *     navigate('/collections');
 *   }
 * };
 *
 * // In UnsavedChangesWarning dialog:
 * <UnsavedChangesWarning
 *   open={showWarning}
 *   onKeepEditing={handleKeepEditing}
 *   onDiscardChanges={handleDiscardChanges}
 * />
 */
const useUnsavedChanges = () => {
  // Local state for warning dialog visibility
  const [showWarning, setShowWarning] = useState(false);

  // Get unsaved changes state from store
  const hasUnsavedChanges = useEditCollectionStore((state) =>
    state.hasUnsavedChanges(),
  );

  // Get resetChanges action from store
  const resetChanges = useEditCollectionStore((state) => state.resetChanges);

  /**
   * Handle navigation attempt when user has unsaved changes.
   * Shows warning dialog to confirm discarding changes.
   */
  const handleNavigationAttempt = useCallback(() => {
    setShowWarning(true);
  }, []);

  /**
   * Handle user choice to keep editing.
   * Closes warning dialog and remains on edit page.
   */
  const handleKeepEditing = useCallback(() => {
    setShowWarning(false);
  }, []);

  /**
   * Handle user choice to discard changes.
   * Resets store to original state and closes warning dialog.
   * Component should handle actual navigation after calling this.
   */
  const handleDiscardChanges = useCallback(() => {
    resetChanges();
    setShowWarning(false);
  }, [resetChanges]);

  return {
    hasUnsavedChanges,
    showWarning,
    handleNavigationAttempt,
    handleKeepEditing,
    handleDiscardChanges,
  };
};

export default useUnsavedChanges;
