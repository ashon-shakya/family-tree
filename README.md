# Family Tree Builder

A React-based web application for creating and visualizing family trees with a modern UI. Built with D3.js for interactive tree rendering, it features draggable nodes styled as CSS cards, gender-based coloring, and data import/export functionality.

## Features

- **Modern CSS Card Nodes**: Each person is displayed as a sleek card with a placeholder image, name, birth year, and gender. Cards use pastel colors based on gender (blue for male, pink for female, beige for other).
- **Interactive Dragging**: Nodes can be dragged to custom positions, with arrows updating in real-time to reflect new layouts.
- **Single Node per Person**: Children with both parents appear as a single node, with arrows from both father and mother, avoiding duplicates.
- **Form-Based Input**: Add people via a form with fields for name, birth year, gender (Male, Female, Other), father (male only), and mother (female only).
- **Data Persistence**: Export family tree data as JSON and import it to restore the tree, including custom node positions.
- **Clear Functionality**: Reset the tree with a confirmation prompt.
- **Responsive Design**: The UI is clean and functional, with Tailwind CSS 4 for styling.

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, etc.)

## Setup

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd family-tree-builder
   ```

2. **Install Dependencies**:
   Install the required npm packages:

   ```bash
   npm install
   ```

   The project depends on:

   - `react`
   - `react-dom`
   - `d3`
   - `d3-hierarchy`

3. **Run the Application**:
   Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal).

## Usage

1. **Adding a Person**:

   - Use the form on the left to enter:
     - **Name**: The person's name.
     - **Birth Year**: A numeric year (e.g., 1970).
     - **Gender**: Select Male, Female, or Other.
     - **Father**: Choose a male from the dropdown (optional).
     - **Mother**: Choose a female from the dropdown (optional).
   - Click **Add Person** to add them to the tree.
   - Example: Add "John" (Male, 1970), "Mary" (Female, 1972), then "Jane" (Female, 2000, with John as father and Mary as mother).

2. **Visualizing the Tree**:

   - The tree appears on the right as a set of cards connected by arrows.
   - Each card shows a placeholder image (gender-specific), name, birth year, and gender.
   - Arrows indicate parent-child relationships, with one arrow from each parent to a child.

3. **Dragging Nodes**:

   - Click and drag any card to reposition it.
   - The card follows the mouse exactly, and arrows update to reflect the new position.
   - Positions are saved and persist across renders.

4. **Exporting Data**:

   - Click **Download Data** to save the family tree as a `family_tree_data.json` file.
   - The JSON includes all people, their details, and custom positions.

5. **Importing Data**:

   - Click **Upload Data** and select a previously exported `.json` file.
   - The tree will be restored, including node positions.

6. **Clearing the Tree**:
   - Click **Clear** to remove all people.
   - Confirm the action in the prompt.

## Screenshots

_(Add screenshots here to showcase the UI. For example:)_

- _Main interface with form and tree_
- _A sample family tree with dragged nodes_
- _CSS card node close-up_

To add screenshots:

1. Take screenshots of the running app.
2. Place them in a `screenshots/` folder in the project root.
3. Update this README with markdown image links:
   ```markdown
   ![Main Interface](screenshots/main-interface.png)
   ```

## Project Structure

- `src/App.jsx`: Main component with the form, tree rendering, and data handling logic.
- `src/index.jsx`: Entry point for the React app.
- `package.json`: Project dependencies and scripts.
- `public/`: Static assets (e.g., `index.html`).

## Dependencies

- **React**: Front-end framework for building the UI.
- **D3.js**: Library for rendering the tree and handling drag interactions.
- **d3-hierarchy**: D3 module for hierarchical data structures.
- **Tailwind CSS 4**: Styling framework for the modern UI.

## Troubleshooting

- **Nodes shift when dragging**:
  - Ensure no console errors in the browser's developer tools.
  - Verify the `d3.pointer` calculation in the drag handler is using `event.sourceEvent`.
  - Check that the `nodeWidth` (180) and `nodeHeight` (220) match the card dimensions.
- **Images not loading**:
  - Confirm internet access for placeholder images (`via.placeholder.com`).
  - Consider hosting images locally or adding an `imageUrl` field to `person` objects.
- **Tree not rendering**:
  - Check the `people` state in the browser's React DevTools.
  - Ensure `fatherId` and `motherId` reference valid person IDs.
- **Import fails**:
  - Verify the JSON file is valid and matches the expected format (array of person objects with `id`, `name`, `birthYear`, `gender`, `fatherId`, `motherId`, `position`).

For further issues, open an issue on the repository or check the console for errors.

## Future Improvements

- **Custom Images**: Add support for uploading profile images via the form.
- **Zoom and Pan**: Implement D3 zoom for navigating large trees.
- **Drag Bounds**: Restrict dragging to the SVG area.
- **Node Editing**: Allow editing or deleting people directly on the tree.
- **Responsive Nodes**: Adjust card size for smaller screens.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature
