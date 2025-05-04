import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const PersonForm = ({ onAddPerson, onClearPeople, people }) => {
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && birthYear && gender) {
      onAddPerson({
        id: Date.now().toString(),
        name,
        birthYear: parseInt(birthYear),
        gender,
        fatherId: fatherId || null,
        motherId: motherId || null,
      });
      setName("");
      setBirthYear("");
      setGender("");
      setFatherId("");
      setMotherId("");
    }
  };

  const handleClear = () => {
    onClearPeople();
  };

  // Filter people for father (male only) and mother (female only)
  const malePeople = people.filter((person) => person.gender === "Male");
  const femalePeople = people.filter((person) => person.gender === "Female");

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md w-full max-w-sm">
      <h2 className="text-xl font-semibold mb-4">Add Person</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Birth Year"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={fatherId}
          onChange={(e) => setFatherId(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Father</option>
          {malePeople.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} ({person.birthYear})
            </option>
          ))}
        </select>
        <select
          value={motherId}
          onChange={(e) => setMotherId(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">No Mother</option>
          {femalePeople.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} ({person.birthYear})
            </option>
          ))}
        </select>
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Add Person
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [people, setPeople] = useState([]);
  const svgRef = useRef(null);
  const fileInputRef = useRef(null);

  const pastelBlue = "#ADD8E6";
  const pastelPink = "#FFB6C1";
  const pastelOther = "#FAF0E6";
  const linkColor = "#A9A9A9";

  const getHierarchyDataAndLinks = () => {
    const nodeMap = new Map();
    people.forEach((person) => {
      nodeMap.set(person.id, { ...person, children: [] });
    });

    const rootNodes = [];
    const allLinks = [];

    people.forEach((person) => {
      const node = nodeMap.get(person.id);
      let addedToHierarchy = false;

      if (person.fatherId) {
        const father = nodeMap.get(person.fatherId);
        if (father) {
          if (!addedToHierarchy) {
            father.children.push(node);
            addedToHierarchy = true;
          }
          allLinks.push({ source: father, target: node });
        }
      }

      if (person.motherId) {
        const mother = nodeMap.get(person.motherId);
        if (mother) {
          if (!addedToHierarchy) {
            mother.children.push(node);
            addedToHierarchy = true;
          }
          allLinks.push({ source: mother, target: node });
        }
      }

      if (!person.fatherId && !person.motherId) {
        rootNodes.push(node);
      }
    });

    return {
      hierarchyData:
        rootNodes.length > 0
          ? rootNodes
          : [{ id: "dummy", name: "", children: [] }],
      links: allLinks,
    };
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const nodeWidth = 180;
    const nodeHeight = 220;
    const verticalSpacing = 150;

    svg.attr("width", width).attr("height", height);

    const { hierarchyData, links } = getHierarchyDataAndLinks();
    const root = d3.hierarchy({
      id: "root",
      children: hierarchyData,
    });

    const treeLayout = d3
      .tree()
      .nodeSize([nodeWidth + 50, nodeHeight + verticalSpacing]);
    const treeData = treeLayout(root);

    const nodes = treeData
      .descendants()
      .filter((d) => d.data.id !== "root" && d.data.id !== "dummy");
    nodes.forEach((d) => {
      const person = people.find((p) => p.id === d.data.id);
      if (person && person.position) {
        d.x = person.position.x;
        d.y = person.position.y;
      }
    });

    const xMin = d3.min(nodes, (d) => d.x);
    const yMin = d3.min(nodes, (d) => d.y);
    nodes.forEach((d) => {
      d.x += xMin < 0 ? -xMin + 50 : 50;
      d.y += yMin < 0 ? -yMin + 50 : 50;
    });

    const nodeMap = new Map(nodes.map((d) => [d.data.id, d]));
    const updatedLinks = links
      .map((link) => {
        const sourceNode = nodeMap.get(link.source.id);
        const targetNode = nodeMap.get(link.target.id);
        if (sourceNode && targetNode) {
          return { source: sourceNode, target: targetNode };
        }
        return null;
      })
      .filter((link) => link !== null);

    const linkGroup = svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke", linkColor)
      .attr("stroke-width", 2);
    const linkSelection = linkGroup
      .selectAll("path")
      .data(updatedLinks)
      .enter()
      .append("path")
      .attr("d", (d) => {
        return `M${d.source.x},${d.source.y + nodeHeight / 2} 
                C${d.source.x},${
          d.source.y + nodeHeight / 2 + verticalSpacing / 2
        } 
                 ${d.target.x},${
          d.target.y - nodeHeight / 2 - verticalSpacing / 2
        } 
                 ${d.target.x},${d.target.y - nodeHeight / 2}`;
      })
      .attr("marker-end", "url(#arrowhead)");

    const nodeGroup = svg.append("g");
    const nodeSelection = nodeGroup
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d) => `translate(${d.x - nodeWidth / 2},${d.y - nodeHeight / 2})`
      )
      .call(
        d3
          .drag()
          .on("start", function (event, d) {
            d3.select(this).raise();
            // Get current transform
            const transform = d3.select(this).attr("transform");
            const translate = transform.match(/translate\(([^,]+),([^\)]+)\)/);
            const currentX = translate ? parseFloat(translate[1]) : 0;
            const currentY = translate ? parseFloat(translate[2]) : 0;
            // Get mouse position in SVG coordinates
            const mouse = d3.pointer(event.sourceEvent, svg.node());
            // Calculate offset from mouse to node center
            d.dragOffset = {
              x: mouse[0] - (currentX + nodeWidth / 2),
              y: mouse[1] - (currentY + nodeHeight / 2),
            };
          })
          .on("drag", function (event, d) {
            // Update node position using mouse position
            const mouse = d3.pointer(event.sourceEvent, svg.node());
            d.x = mouse[0] - d.dragOffset.x;
            d.y = mouse[1] - d.dragOffset.y;
            d3.select(this).attr(
              "transform",
              `translate(${d.x - nodeWidth / 2},${d.y - nodeHeight / 2})`
            );

            // Update links
            linkSelection.attr("d", (link) => {
              return `M${link.source.x},${link.source.y + nodeHeight / 2} 
                      C${link.source.x},${
                link.source.y + nodeHeight / 2 + verticalSpacing / 2
              } 
                       ${link.target.x},${
                link.target.y - nodeHeight / 2 - verticalSpacing / 2
              } 
                       ${link.target.x},${link.target.y - nodeHeight / 2}`;
            });

            // Update people state
            setPeople((prev) =>
              prev.map((p) =>
                p.id === d.data.id ? { ...p, position: { x: d.x, y: d.y } } : p
              )
            );
          })
          .on("end", function (d) {
            delete d.dragOffset;
          })
      );

    nodeSelection
      .append("foreignObject")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .append("xhtml:div")
      .style("width", `${nodeWidth}px`)
      .style("height", `${nodeHeight}px`)
      .attr(
        "class",
        "p-4 rounded-xl shadow-lg text-center cursor-move transition-transform hover:shadow-xl"
      )
      .style("background-color", (d) => {
        if (d.data.gender === "Male") return pastelBlue;
        if (d.data.gender === "Female") return pastelPink;
        return pastelOther;
      })
      .html((d) => {
        // Use placeholder images based on gender
        const imageUrl =
          d.data.gender === "Male"
            ? "https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=612x612&w=0&k=20&c=BpR0FVaEa5F24GIw7K8nMWiiGmbb8qmhfkpXcp1dhQg="
            : d.data.gender === "Female"
            ? "https://media.istockphoto.com/id/2060009001/vector/avatar-user-profile-person-icon-profile-picture-for-social-media-profiles-icons-screensavers.jpg?s=612x612&w=0&k=20&c=onk7rmEoISSvHVlqc-SiBvcUr8ilCm2u9kcw3_Bm_SA="
            : "https://via.placeholder.com/100/FAF0E6/FFFFFF?text=Other";
        return `
          <div class="flex flex-col items-center h-full">
            <img src="${imageUrl}" alt="${d.data.name}" class="w-24 h-24 rounded-full object-cover mb-3 border-2 border-white shadow-sm" />
            <h3 class="text-lg font-semibold text-gray-800 truncate w-full">${d.data.name}</h3>
            <p class="text-sm text-gray-600 mt-1">Born: ${d.data.birthYear}</p>
            <p class="text-sm text-gray-600">Gender: ${d.data.gender}</p>
          </div>
        `;
      });

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("markerWidth", 10)
      .attr("markerHeight", 7)
      .attr("refX", 8)
      .attr("refY", 3.5)
      .attr("orient", "auto")
      .append("polygon")
      .attr("points", "0 0, 10 3.5, 0 7")
      .attr("fill", linkColor);
  }, [people, pastelBlue, pastelPink, pastelOther, linkColor]);

  const addPerson = (person) => {
    setPeople([...people, person]);
  };

  const clearPeople = () => {
    if (window.confirm("Are you sure you want to clear all persons?")) {
      setPeople([]);
    }
  };

  const downloadData = () => {
    const jsonData = JSON.stringify(people, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "family_tree_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uploadData = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedPeople = JSON.parse(e.target.result);
          setPeople(loadedPeople);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          alert("Error loading data: Invalid JSON format.");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side: Person Form and Data Buttons */}
      <div className="w-1/3 p-6 flex flex-col items-start space-y-4">
        <PersonForm
          onAddPerson={addPerson}
          onClearPeople={clearPeople}
          people={people}
        />
        <div className="flex space-x-2">
          <button
            onClick={downloadData}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
          >
            Download Data
          </button>
          <button
            onClick={uploadData}
            className="bg-yellow-500 text-black p-2 rounded hover:bg-yellow-600 transition"
          >
            Upload Data
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".json"
          />
        </div>
      </div>
      {/* Right Side: Family Tree */}
      <div className="w-2/3 p-6 relative overflow-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Family Tree</h1>
        <svg ref={svgRef} className="w-full h-[600px]"></svg>
      </div>
    </div>
  );
};

export default App;
