import PropTypes from "prop-types";
import Image01 from "../../assets/images/01.png";
import Image02 from "../../assets/images/02.png";
import Image03 from "../../assets/images/03.png";
import Image04 from "../../assets/images/04.png";

const imageMap = {
  1: Image01,
  2: Image02,
  3: Image03,
  4: Image04,
};

/**
 * PersonCard component for displaying individual person information
 *
 * @param {Object} props - Component props
 * @param {Object} props.person - Person data to display
 * @param {Function} props.onEdit - Function called when edit button is clicked
 * @param {Function} props.onDelete - Function called when delete button is clicked
 * @param {Function} props.onSelect - Function called when card is selected
 * @param {boolean} props.isSelected - Whether the card is currently selected
 */
const PersonCard = ({
  person,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  if (!person) return null;

  /**
   * Handle edit button click
   * @param {Event} e - Click event
   */
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(person);
  };

  /**
   * Handle delete button click with confirmation
   * @param {Event} e - Click event
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${person.name}?`)) {
      onDelete(person.id);
    }
  };

  /**
   * Handle card click for selection
   */
  const handleCardClick = () => {
    onSelect(person);
  };

  return (
    <div
      className={`p-4 border rounded-lg shadow-sm transition-all cursor-pointer hover:shadow-md ${
        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="relative h-12 w-12 mr-3 flex-shrink-0">
            <img
              src={imageMap[person.imageId || 1]}
              alt={person.name}
              className="h-12 w-12 object-cover rounded-full border-2 border-gray-200"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
            {person.nameZh && (
              <p className="text-sm text-gray-600 mt-1">{person.nameZh}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleEdit}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-500 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {person.notes && (
        <div className="mt-3 text-sm text-gray-500 border-t pt-2 border-gray-100">
          <p className="line-clamp-2">{person.notes}</p>
        </div>
      )}

      {/* Display relationship counts if available */}
      {(person.relationshipsFrom?.length > 0 ||
        person.relationshipsTo?.length > 0) && (
        <div className="mt-3 flex space-x-3 text-xs text-gray-500">
          {person.relationshipsFrom?.length > 0 && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {person.relationshipsFrom.length} outgoing
            </span>
          )}
          {person.relationshipsTo?.length > 0 && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {person.relationshipsTo.length} incoming
            </span>
          )}
        </div>
      )}
    </div>
  );
};

PersonCard.propTypes = {
  person: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    nameZh: PropTypes.string,
    notes: PropTypes.string,
    imageId: PropTypes.number,
    relationshipsFrom: PropTypes.array,
    relationshipsTo: PropTypes.array,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

export default PersonCard;
