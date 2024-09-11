import React, { useState } from 'react';
import Editor from './Editor2';
import Section from '../../Common/Section';
import { WhiteButtonSM } from '../../Common/Buttons';

const CreateStory = (props) => {
  let [openEditor, setOpenEditor] = useState(false);
  return (
    <Section title="Create" textStyles={false}>
      <div>
        <WhiteButtonSM
          disabled={openEditor}
          onClick={() => setOpenEditor(!openEditor)}
        >
          Create Story
        </WhiteButtonSM>
        <div style={{ display: openEditor ? 'block' : 'none' }}>
          <Editor
            action="create"
            onSubmit={() => setOpenEditor(false)}
            onCancel={() => setOpenEditor(false)}
          />
        </div>
      </div>
    </Section>
  );
};

export default CreateStory;
