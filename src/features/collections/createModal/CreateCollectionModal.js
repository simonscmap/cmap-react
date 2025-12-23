import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Add } from '@material-ui/icons';
import CreateCollectionWithDatasetsModal from '../createWithDatasets/CreateCollectionWithDatasetsModal';
import UniversalButton from '../../../shared/components/UniversalButton';
import { showLoginDialog } from '../../../Redux/actions/ui';

const CreateCollectionModal = () => {
  const [open, setOpen] = useState(false);
  const triggerButtonRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isLoggedIn = Boolean(user);

  useEffect(() => {
    if (!open && triggerButtonRef.current) {
      const timer = setTimeout(() => {
        triggerButtonRef.current.focus();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClick = () => {
    if (isLoggedIn) {
      setOpen(true);
    } else {
      dispatch(showLoginDialog());
    }
  };

  return (
    <>
      <UniversalButton
        ref={triggerButtonRef}
        variant="primary"
        size="large"
        onClick={handleClick}
        startIcon={<Add />}
        disableRipple
        style={!isLoggedIn ? { opacity: 0.5 } : undefined}
      >
        {isLoggedIn ? 'CREATE NEW COLLECTION' : 'SIGN IN TO CREATE COLLECTION'}
      </UniversalButton>

      <CreateCollectionWithDatasetsModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export default CreateCollectionModal;
