/**
 * PaginationController Component
 *
 * A controller component that combines pagination state management (via usePagination hook)
 * with UI rendering (via Pagination component), providing a simple declarative API for
 * common pagination patterns.
 *
 * BASIC USAGE:
 * ```jsx
 * <PaginationController
 *   data={filteredCollections}
 *   itemsPerPage={9}
 *   renderItem={(item) => <ItemCard key={item.id} item={item} />}
 * />
 * ```
 *
 * ADVANCED USAGE:
 * ```jsx
 * <PaginationController
 *   data={filteredCollections}
 *   itemsPerPage={9}
 *   renderItem={(item, index) => <ItemCard key={item.id} item={item} index={index} />}
 *   containerProps={{ className: 'custom-container' }}
 *   paginationProps={{ size: 'small', showFirstButton: true }}
 *   loading={isLoading}
 *   loadingComponent={<Spinner />}
 *   emptyComponent={<EmptyState message="No items found" />}
 *   renderContainer={(children, pagination) => (
 *     <div className="custom-layout">
 *       {children}
 *       <div className="pagination-wrapper">{pagination}</div>
 *     </div>
 *   )}
 * />
 * ```
 *
 * FEATURES:
 * - Combines state management and UI in a single component
 * - Simple declarative API for common pagination patterns
 * - Built on usePagination hook (no logic duplication)
 * - Loading and empty state support
 * - Flexible customization through props
 * - Custom layout control via renderContainer
 * - Progressive enhancement from simple to complex use cases
 */

import React from 'react';
import usePagination from './usePagination';
import Pagination from './Pagination';

/**
 * @param {Object} props
 * @param {Array} props.data - Array of items to paginate
 * @param {number} props.itemsPerPage - Number of items per page
 * @param {function} props.renderItem - Function to render each item: (item, index) => ReactNode
 * @param {Object} [props.containerProps={}] - Props to pass to the default container div
 * @param {Object} [props.paginationProps={}] - Additional props to pass to Pagination component
 * @param {function} [props.renderContainer] - Custom container renderer: (children, pagination) => ReactNode
 * @param {boolean} [props.loading=false] - Loading state
 * @param {ReactNode} [props.loadingComponent] - Component to show during loading
 * @param {ReactNode} [props.emptyComponent] - Component to show when data is empty
 */
const PaginationController = ({
  data,
  itemsPerPage,
  renderItem,
  containerProps = {},
  paginationProps = {},
  renderContainer,
  loading = false,
  loadingComponent,
  emptyComponent,
  ...restProps
}) => {
  // Use foundation hook
  const { paginatedData, paginationProps: hookPaginationProps } = usePagination(
    {
      data,
      itemsPerPage,
    },
  );

  // Handle loading state
  if (loading && loadingComponent) {
    return loadingComponent;
  }

  // Handle empty state
  if (!loading && data?.length === 0 && emptyComponent) {
    return emptyComponent;
  }

  // Render items
  const items = paginatedData.map((item, index) => renderItem(item, index));

  // Render pagination
  const pagination = hookPaginationProps.shouldShow ? (
    <Pagination {...hookPaginationProps} {...paginationProps} />
  ) : null;

  // Custom container renderer
  if (renderContainer) {
    return renderContainer(items, pagination);
  }

  // Default layout
  return (
    <div {...containerProps} {...restProps}>
      {items}
      {pagination}
    </div>
  );
};

export default PaginationController;
