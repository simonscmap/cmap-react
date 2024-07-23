import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import React, { useEffect } from 'react';
import clsx from 'clsx';
import { data, findById } from './tableOfContents';
import useStyles from './treeStyles';

const NavigationTree = (props) => {
  const { setContent, current } = props;
  const cl = useStyles();

  const [expanded, setExpanded] = React.useState([]);
  const [selected, setSelected] = React.useState([]);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeId) => {
    setContent (nodeId, true); // true flag for clearing focus
    setSelected (nodeId);
  };


  useEffect (() => {
    const c = findById (current.id);
    const itemsToExpand = c.path.map (({ id }) => id);

    if (!itemsToExpand.every ((requiredId) => expanded.some ((expId) => expId === requiredId))) {
      // ensure path to current item is expanded
      setExpanded (itemsToExpand);
    }
    // scroll
    const scrollContainer = document.getElementById ('nav-scroll-container');
    const el = document.querySelector(`[dataid="${current.id}"]`);
    if (el && scrollContainer) {
      setTimeout (() => {
        scrollContainer.scrollTop = el.offsetTop - 132;
      }, 1)
    }
  }, [current]);

  // Render Tree
  const renderTree = (nodes) => {
    const classes = [cl.item];
    if (nodes.id === current.id) {
      classes.push (cl.highlight); // highlight the currently shown item
      // NOTE this differs from the 'selected' behavior of the TreeView
      // which allows for multiple items to be selected
    }
    return (
      <TreeItem
        className={clsx(classes)}
        key={nodes.id}
        nodeId={nodes.id}
        label={nodes.name}
        dataid={nodes.id}
      >
          {
            Array.isArray(nodes.children)
              ? nodes.children.map((node) => renderTree(node))
              : null
          }
      </TreeItem>
    );
  }

  // Return Tree
  return (
    <TreeView
      className={cl.root}
      defaultSelected={'getting-started'}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      selected={selected}
      onNodeToggle={handleToggle}
      onNodeSelect={handleSelect}
    >
      {data.map (renderTree)}
    </TreeView>
  );
};

export default NavigationTree;
