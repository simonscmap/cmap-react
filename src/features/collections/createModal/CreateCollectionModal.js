import React, { useState, useEffect, useRef } from 'react';
import { Add } from '@material-ui/icons';
import CreateCollectionWithDatasetsModal from '../createWithDatasets/CreateCollectionWithDatasetsModal';
import UniversalButton from '../../../shared/components/UniversalButton';

const CreateCollectionModal = () => {
  const [open, setOpen] = useState(false);
  const triggerButtonRef = useRef(null);

  useEffect(() => {
    if (!open && triggerButtonRef.current) {
      const timer = setTimeout(() => {
        triggerButtonRef.current.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      <UniversalButton
        ref={triggerButtonRef}
        variant="primary"
        size="large"
        onClick={() => setOpen(true)}
        startIcon={<Add />}
        disableRipple
      >
        CREATE NEW COLLECTION
      </UniversalButton>

      <CreateCollectionWithDatasetsModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default CreateCollectionModal;
