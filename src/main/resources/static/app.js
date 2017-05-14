var FieldName = React.createClass({
  getInitialState() {
    return { isEditing: false, newValue: "" };
  },

  readValue(event) {
    this.setState({ newValue: event.target.value });
  },

  toggleEditing() {
    this.setState({ isEditing: !this.state.isEditing });
  },
  requestChange(e) {
    e.preventDefault();
    const fieldName = this.props.field;
    const obj = {};
    obj[fieldName] = this.state.newValue;
    this.props.requestChange(obj);
    this.setState({ changed: true, isEditing: false });
  },
  render() {
    let msg = this.state.changed ? this.state.newValue : this.props.msg;
    let output;
    if (!this.state.isEditing) {
      return <div onClick={this.toggleEditing}>{msg}</div>;
    } else {
      return (
        <form>
          <input
            ref={el => {
              this[this.props.field] = el;
            }}
            type="text"
            placeholder={this.props.msg}
            value={this.state.newValue}
            onChange={this.readValue}
          />
          <button className="btn btn-primary" onClick={this.requestChange}>
            Submit
          </button>
        </form>
      );
    }
  }
});

var Reference = React.createClass({
  requestChange(obj) {
    const self = this;
    console.log("request change in reference");
    $.ajax({
      url: this.props.reference._links.self.href,
      method: "PATCH",
      data: JSON.stringify(obj),
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      success: function(result) {
        console.log(result);
        self.setState({ reference: result });
        self.forceUpdate();
      },
      error: function(xhr, ajaxOptions, thrownError) {
        toastr.error(xhr.responseJSON.message);
      }
    });
  },

  handleDelete: function(e) {
    e.preventDefault();
    this.setState({ thumbnail: null });
    this.props.handleDelete(this.props.reference);
  },

  getInitialState: function() {
    return { display: true, checked: false, reference: this.props.reference };
  },

  toggleCheck: function() {
    return this.setState({ checked: !this.state.checked });
  },

  render: function() {
    const isChecked = this.state.isChecked ? "isChecked" : "";
    if (this.state.display == false) return null;
    else
      return (
        <tr>
          <td>
            <input
              type="checkbox"
              className="check"
              checked={this.state.checked}
              onClick={this.toggleCheck}
            />
          </td>
          <td><img src={this.props.reference.thumbnail} /></td>
          <td>
            <FieldName
              field="author"
              msg={this.props.reference.author}
              reference={this.state.reference}
              requestChange={this.requestChange}
            />
          </td>
          <td>
            <FieldName
              field="title"
              msg={this.props.reference.title}
              reference={this.state.reference}
              requestChange={this.requestChange}
            />
          </td>
          <td>
            <FieldName
              field="year"
              msg={this.props.reference.year}
              reference={this.state.reference}
              requestChange={this.requestChange}
            />
          </td>
          <td>
            <FieldName
              field="journal"
              msg={this.props.reference.journal}
              reference={this.state.reference}
              requestChange={this.requestChange}
            />
          </td>
          <td>
            <button className="btn btn-info" onClick={this.handleDelete}>
              Delete
            </button>
          </td>
        </tr>
      );
  }
});

var ReferenceTable = React.createClass({
  handleDelete: function(reference) {
    this.props.handleDelete(reference);
  },

  handleMultipleDeletes: function(e) {
    e.preventDefault();

    for (let key in this) {
      if (key.indexOf("reference") > -1) {
        if (this[key].state.checked) {
          this.props.handleDelete(this[key].props.reference);
        }
      }
    }
  },

  getInitialState: function() {
    return {};
  },

  selectAll: function(e) {
    e.preventDefault();

    for (let key in this) {
      if (key.indexOf("reference") > -1) {
        this[key].toggleCheck();
      }
    }
  },

  showModal(e, modal) {
    e.preventDefault();

    const modalMap = {
      'addref' : '.addref-wrapper',
      'upload' : '.upload-wrapper'
    }

    $(modalMap[modal]).css({'display':'initial', 'visibility': 'visible'});
  },

  render: function() {
    var rows = [];
    var self = this;
    this.props.references.forEach(function(reference, i) {
      rows.push(
        <Reference
          reference={reference}
          handleDelete={self.handleDelete}
          ref={el => {
            self["reference" + i] = el;
          }}
        />
      );
    });

    return (
      <div>
        <form role="form">
          <div className='left-buttons'>
            <button className="btn btn-primary select" id="checkAll" onClick={this.selectAll}>
              Select All
            </button>
            <button className="btn btn-primary delete" onClick={this.handleMultipleDeletes}>
              Delete
            </button>
          </div>
          <div className='right-buttons'>
            <input
              className="form-control search"
              type="text"
              name="search"
              placeholder="Search"
              onChange={(e) => { this.props.search(e.target.value) }}
            />
            <button className="btn btn-primary upload" id="upload" onClick={(e) => {this.showModal(e, 'upload')}}>
              Upload BibTex
            </button>
            <button className="btn btn-primary addref" onClick={(e) => {this.showModal(e, 'addref')}}>
              Add a Reference
            </button>
            <button className="btn btn-danger" onClick={this.props.exportFile}>
              Export Bib
            </button>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Select</th>
                <th><strong>Cover</strong></th>
                <th>
                  <strong
                    onClick={() => {
                      this.props.reOrder("author");
                    }}
                  >
                    Author
                  </strong>
                </th>
                <th>
                  <strong
                    onClick={() => {
                      this.props.reOrder("title");
                    }}
                  >
                    Title
                  </strong>
                </th>
                <th>
                  <strong
                    onClick={() => {
                      this.props.reOrder("year");
                    }}
                  >
                    Year
                  </strong>
                </th>
                <th>
                  <strong
                    onClick={() => {
                      this.props.reOrder("journal");
                    }}
                  >
                    Journal
                  </strong>
                </th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        </form>
      </div>
    );
  }
});

var UploadReferencesForm = React.createClass({
  upload: function() {
    var vcfData = new FormData($("#uploadform")[0]);
    this.props.upload(vcfData);
  },

  closeModal() {
    $('.upload-wrapper').css({'display':'none', 'visibility': 'hidden'});
  },

  render: function() {
    return (
      <div className="upload-container">
        <h4 onClick={this.closeModal}>Close</h4>
        <h1>Upload BibTex File</h1>

        <form
          name="form"
          id="uploadform"
          method="POST"
          encType="multipart/form-data"
          action="/uploadfile"
        >
          <table>
            <tbody>
              <tr>
                <td>File to upload:</td><td><input type="file" name="file" /></td>
              </tr>
              <tr>
                <td />
                <td>
                  <button
                    type="button"
                    id="uploadfiles"
                    form="form"
                    value="Upload"
                    onClick={this.upload}
                  >
                    UPLOAD
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
});

var AddReferencesForm = React.createClass({
  getInitialState: function() {
    return {
      author: "",
      title: "",
      year: "",
      journal: ""
    };
  },

  handleInputChange: function(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  },

  handleSubmit: function(event) {
    event.preventDefault();

    this.props.add({
      author: this.state.author,
      title: this.state.title,
      year: this.state.year,
      journal: this.state.journal
    });
  },

  closeModal() {
    $('.addref-wrapper').css({'display':'none', 'visibility': 'hidden'});
  },

  render: function() {
    return (
      <div className="addref-container">
        <h4 onClick={this.closeModal}>Close</h4>
        <h1>Add a Reference</h1>

        <form onSubmit={this.handleSubmit}>
          <div className="form-group row">
            <div className="col-2 col-form-label">Author</div>
            <input
              className="col-10 form-control"
              type="text"
              name="author"
              placeholder={this.state.author}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-group row">
            <div className="col-2 col-form-label">Title</div>
            <input
              className="col-10 form-control"
              type="text"
              name="title"
              placeholder={this.state.title}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-group row">
            <div className="col-2 col-form-label">Year</div>
            <input
              className="col-10 form-control"
              type="text"
              name="year"
              placeholder={this.state.year}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-group row">
            <div className="col-2 col-form-label">Journal</div>
            <input
              className="col-10 form-control"
              type="text"
              name="journal"
              placeholder={this.state.journal}
              onChange={this.handleInputChange}
            />
          </div>

          <input className="btn btn-info" type="submit" value="Submit" />
        </form>
      </div>
    );
  }
});

var App = React.createClass({
  handleDelete: function(reference) {
    const indexOfDeleted = this.state.references.indexOf(reference);

    var self = this;
    $.ajax({
      url: reference._links.self.href,
      method: "DELETE",
      success: function(result) {
        let newRefs = self.state.references.slice();
        newRefs.splice(indexOfDeleted, 1);
        self.setState({ references: newRefs });
      },
      error: function(xhr, ajaxOptions, thrownError) {
        toastr.error(xhr.responseJSON.message);
      }
    });
  },

  loadReferencesFromServer: function(callback) {
    var self = this;
    $.ajax({
      url: "http://localhost:8080/api/references"
    }).then(function(data) {
      self.setState({ originalRefs: data._embedded.references, references: data._embedded.references });
      callback();
    });
  },

  getInitialState: function() {
    return { originRefs: [], references: [], order: [] };
  },

  componentDidMount: function() {
    this.loadReferencesFromServer(this.getThumbs);
  },

  add(obj) {
    var self = this;
    $.ajax({
      url: "http://localhost:8080/api/references",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      dataType: "json",
      data: JSON.stringify(obj),
      success: function(result) {
        self.setState({ references: self.state.references.concat(result) });
      },
      error: function(xhr, ajaxOptions, thrownError) {
        toastr.error(xhr.responseJSON.message);
      }
    });
  },

  search(value) {
    let filteredRefs = [];
    value = value.toLowerCase();
    for (let ref in this.state.originalRefs) {
      const thisRef = this.state.originalRefs[ref];
      if (thisRef.title.toLowerCase().indexOf(value) > -1 ||
          thisRef.author.toLowerCase().indexOf(value) > -1 ||
          thisRef.year.toLowerCase().indexOf(value) > -1 ||
          thisRef.journal.toLowerCase().indexOf(value) > -1) {
        filteredRefs.push(this.state.originalRefs[ref]);
      }
    }
    this.setState({ references: filteredRefs});
  },

  getThumbs: function() {
    this.state.references.forEach((el, i) => {

      const self = this;
      $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes?q=" +
          el.title +
          "&fields=items(volumeInfo(imageLinks(thumbnail)))",
        headers: {
          "Content-Type": "application/json"
        },
        method: "GET",
        dataType: "json",
        success: function(result) {
          const thumb = result.items[0].volumeInfo.imageLinks.thumbnail;
          const newRefs = self.state.references;
          const refWithThumb = newRefs[i];
          refWithThumb.thumbnail = thumb;
          self.setState({ references: newRefs });
        },
        error: function(xhr, ajaxOptions, thrownError) {
          const thumb = '/defaultcover.jpg';
          const newRefs = self.state.references;
          const refWithThumb = newRefs[i];
          refWithThumb.thumbnail = thumb;
          self.setState({ references: newRefs });
          // toastr.error(xhr.responseJSON.message);
        }
      });
    });
  },

  reOrder(sortDef) {
    let newRefs = this.state.references;
    let orderRule, newOrder;
    // if we're sorting by this column and it's ascending, make it descending
    const existingOrderRule = this.state.order.find(el => {
      return el.sortDef === sortDef && el.ascending === true;
    });
    if (existingOrderRule) {
      console.log("making it descending");
      newRefs = newRefs.sort(function(a, b) {
        if (a[sortDef] < b[sortDef]) return -1;
        if (a[sortDef] > b[sortDef]) return 1;
        return 0;
      });
      orderRule = { sortDef: sortDef, ascending: false };
    } else {
      console.log("making it ascending");
      // otherwise default to ascending
      newRefs = newRefs.sort(function(a, b) {
        if (a[sortDef] < b[sortDef]) return 1;
        if (a[sortDef] > b[sortDef]) return -1;
        return 0;
      });
      orderRule = { sortDef: sortDef, ascending: true };
    }

    newOrder = this.state.order;
    const indexOfOrderRule = newOrder.indexOf(existingOrderRule);
    if (indexOfOrderRule > -1) {
      newOrder[indexOfOrderRule] = orderRule;
    } else {
      newOrder.push(orderRule);
    }

    this.setState({ references: newRefs, order: newOrder });
  },

  upload(vcfData) {
    var self = this;
    $.ajax({
      url: "/uploadfile",
      type: "post",
      data: vcfData,
      processData: false,
      contentType: false,
      cache: false,
      success: function(filename) {
        $.ajax({
          url: "/parsebib",
          type: "POST",
          data: {
            filename: filename
          },
          success: function(data) {
            self.loadReferencesFromServer(self.getThumbs);
          },
          error: function(data) {
            self.forceUpdate();
          }
        });
      }
    });
  },

  exportFile(e) {
    e.preventDefault();

    let finalFile = '';
    const currentRefs = this.state.references;
    for (let ref in currentRefs) {
      const thisRef = currentRefs[ref];
      const refString = [
        '@article{', ref, '\n',
        'author = ', thisRef.author, '\n',
        'journal = ', thisRef.journal, '\n',
        'title = ', thisRef.title, '\n',
        'year = ', thisRef.year, '\n',
        '},\n\n'
      ].join('');
      finalFile = finalFile.concat(refString);
    };
    window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(finalFile), 'bib.bib');
  },

  render() {
    return (
      <div>
        <div className="col-md-12">
          <ReferenceTable
            references={this.state.references}
            handleDelete={this.handleDelete}
            reOrder={this.reOrder}
            search={this.search}
            exportFile={this.exportFile}
          />
        </div>
        <div className="col-md-6 addref-wrapper">
            <AddReferencesForm add={this.add} />
        </div>
        <div className="col-md-6 upload-wrapper">
          <UploadReferencesForm upload={this.upload} />
        </div>
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById("root"));
