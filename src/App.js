import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    number: '',
  });
  const [selectedContacts, setSelectedContacts] = useState([]);
  const rowsPerPage = 10;

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const fileName = selectedFile.name.toLowerCase();
      const isCsvOrExcel = /\.(csv|xls|xlsx)$/i.test(fileName);

      if (isCsvOrExcel) {
        setFile(selectedFile);
        readAndDisplayFile(selectedFile);
      } else {
        alert('Please select a valid CSV, XLS, or XLSX file.');
        // Optionally, you can clear the file input
        event.target.value = null;
      }
    }
  };

  const readAndDisplayFile = (selectedFile) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target.result;
      const workbook = XLSX.read(result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setTableData(data.slice(1)); // Assuming the first row is the header
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleFilterChange = (e, column) => {
    const value = e.target.value.toLowerCase();
    setFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
  };

  const handleContactSelect = (contactId) => {
    setSelectedContacts((prevSelected) => {
      if (prevSelected.includes(contactId)) {
        return prevSelected.filter((id) => id !== contactId);
      } else {
        return [...prevSelected, contactId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredData.length) {
      // If all contacts are selected, deselect all
      setSelectedContacts([]);
    } else {
      // If not all contacts are selected, select all
      const allFilteredContacts = filteredData.map((_, index) => index + 1);
      setSelectedContacts(allFilteredContacts);
    }
  };

  const handleDownload = () => {
    // Create a new workbook with selected contacts
    const selectedRows = tableData.filter((row, rowIndex) => selectedContacts.includes(rowIndex + 1));
    const selectedWorkbook = XLSX.utils.book_new();
    const selectedWorksheet = XLSX.utils.json_to_sheet(selectedRows);
    XLSX.utils.book_append_sheet(selectedWorkbook, selectedWorksheet, 'Selected Contacts');

    // Save the workbook as an Excel file
    XLSX.writeFile(selectedWorkbook, 'selected_contacts.xlsx');
  };

  // Define a constant header row
  const headerRow = ['name', 'email', 'number'];

  // Filter the data based on the current filters
  const filteredData = tableData.filter((row) =>
    Object.entries(filters).every(([key, value]) =>
      row[headerRow.indexOf(key)].toLowerCase().includes(value)
    )
  );

  // When filters change, unselect all contacts
  useEffect(() => {
    setSelectedContacts([]);
  }, [filters]);

  // Calculate the range of rows to display for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  return (
    <div>
      <div className='upload'>
        <input type='file' onChange={handleFileChange} accept='.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel' />
      </div>
      {tableData.length >= 0 && (
        <div>
          {/* Filter inputs */}
          <div className='filters'>
            {headerRow.map((column, index) => (
              <input key={index} type='text' placeholder={`Filter ${column}`} value={filters[column]} onChange={(e) => handleFilterChange(e, column)} />
            ))}
          </div>

          {/* Table with contact selection */}
          <table>
            <thead>
              <tr>
                <th>
                  <label>
                    <input type='checkbox' onChange={handleSelectAll} checked={selectedContacts.length === filteredData.length && filteredData.length > 0} />
                    Select All
                  </label>
                </th>
                {headerRow.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(startIndex, endIndex).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>
                    <input
                      type='checkbox'
                      checked={selectedContacts.includes(rowIndex + 1)}
                      onChange={() => handleContactSelect(rowIndex + 1)}
                    />
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className='page'>
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous Page
            </button>
            <span> Page {currentPage} </span>
            <button onClick={handleNextPage} disabled={endIndex >= filteredData.length}>
              Next Page
            </button>
          </div>

          {/* Download button */}
          <div className='extra'>
            <button onClick={handleDownload} disabled={selectedContacts.length === 0}>
              Download Selected Contacts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
