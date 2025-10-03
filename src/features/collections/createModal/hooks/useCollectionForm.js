import { useState } from 'react';

export const useCollectionForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleVisibilityChange = (event) => {
    const newValue = event.target.value === 'public';
    setIsPublic(newValue);
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsPublic(false);
  };

  return {
    name,
    description,
    isPublic,
    handleNameChange,
    handleDescriptionChange,
    handleVisibilityChange,
    setIsPublic,
    resetForm,
  };
};
