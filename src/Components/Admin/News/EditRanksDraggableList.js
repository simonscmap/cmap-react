import React, { useState, useEffect } from 'react';
import DraggableStoryContainer from './DraggableStoryContainer';
import { useSelector, useDispatch } from 'react-redux';
import Section from '../../Common/Section';
import { setNewsRanks } from '../../../Redux/actions/news';

import { getRanks, rankedStories, prepareRanksPayload } from './lib';

// For drag and drop reference, see:
// https://dev.to/florantara/creating-a-drag-and-drop-list-with-react-hooks-4c0i

const initialDragState = (storyList) => {
  return {
    draggedFrom: null,
    draggedTo: null,
    isDragging: false,
    originalOrder: storyList,
    updatedOrder: [],
  };
};

const selectStoriesToRank = (state) => {
  let { news } = state;
  let { stories, addRank: unrankedStoriesToRank } = news;
  let storiesToRank = rankedStories(stories).concat(unrankedStoriesToRank);
  return storiesToRank;
};

const EditRankDraggableList = () => {
  let dispatch = useDispatch();
  let storiesToRank = useSelector(selectStoriesToRank);
  let openRanksEditor = useSelector(({ news }) => news.openRanksEditor);

  // TODO -- add unranked story to editor
  const [rankList, setRankList] = useState(storiesToRank);
  const [dragState, setDragState] = useState(initialDragState(storiesToRank));

  let callSetRankList = (s, tag) => {
    //  console.log(`${tag} setting rank list`, s);
    setRankList(s);
  };

  useEffect(() => {
    if (openRanksEditor) {
      // set the visible stories
      callSetRankList(storiesToRank, 'useEffect');
      // prep the payload for the api call
      let payload = prepareRanksPayload(storiesToRank);
      dispatch(setNewsRanks(payload));
    }
  }, [openRanksEditor]); // only run when editor is first opened

  // remove a story from the list
  let deRank = (id) => {
    let newList = rankList.filter(({ ID }) => ID !== id);
    callSetRankList(newList, 'deRank');

    let payload = prepareRanksPayload(newList);
    dispatch(setNewsRanks(payload));

    setDragState({
      ...dragState,
      originalOrder: dragState.originalOrder.filter(({ ID }) => ID !== id),
    });

  };

  const onDragStart = (event) => {
    const initialPosition = Number(event.currentTarget.dataset.position);

    setDragState({
      ...dragState,
      draggedFrom: initialPosition,
      isDragging: true,
      originalOrder: rankList,
    });
    // next line not used, but required for firefox
    event.dataTransfer.setData('text/html', '');
  };

  const onDragOver = (event) => {
    // allow onDrop to fire by cancelling this onDragOver
    event.preventDefault();

    let newList = dragState.originalOrder;
    let draggedFrom = dragState.draggedFrom;
    let draggedTo = Number(event.currentTarget.dataset.position);
    let itemDragged = newList[draggedFrom];
    let remainingItems = newList.filter((item, index) => index !== draggedFrom);

    newList = [
      ...remainingItems.slice(0, draggedTo),
      itemDragged,
      ...remainingItems.slice(draggedTo),
    ];

    if (draggedTo !== dragState.draggedTo) {
      setDragState({
        ...dragState,
        updatedOrder: newList,
        draggedTo: draggedTo,
      });

      // setRankList(newList);
      // create payload from draggable list, using index as rank
      let payload = prepareRanksPayload(newList);
      // udpate redux 'ranks'
      // this is the state that will be used as arg in api call
      console.log('setNewsRanks', payload);
      dispatch(setNewsRanks(payload));
    }
  };

  const onDrop = (event) => {
    callSetRankList(dragState.updatedOrder, 'onDrop');

    setDragState({
      ...dragState,
      draggedFrom: null,
      draggedTo: null,
      isDragging: false,
    });
  };

  const onDragLeave = (event) => {
    setDragState({
      ...dragState,
      draggedTo: null,
    });
  };

  if (!openRanksEditor) {
    return '';
  } else {
    return (
      <Section title="Edit Ranks" textStyles={false}>
        {rankList.map((s, ix) => (
          <DraggableStoryContainer
            key={`${ix}:${s.ID}:${s.headline}`}
            story={s}
            ix={ix}
            deRank={deRank}
            dragPackage={{
              ix,
              dragState,
              onDragStart,
              onDragOver,
              onDrop,
              onDragLeave,
            }}
          ></DraggableStoryContainer>
        ))}
      </Section>
    );
  }
};

export default EditRankDraggableList;
