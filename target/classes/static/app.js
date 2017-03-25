console.log('loading react script')

var Reference = React.createClass({

  getInitialState: function() {
    return {display: true };
  },
  handleDelete() {
    var self = this;
    $.ajax({
        url: self.props.reference._links.self.href,
        type: 'DELETE',
        success: function(result) {
          self.setState({display: false});
        },
        error: function(xhr, ajaxOptions, thrownError) {
          toastr.error(xhr.responseJSON.message);
        }
    });
  },
  render: function() {

    if (this.state.display==false) return null;
    else return (
      <tr>
          <td>{this.props.reference.author}</td>
          <td>{this.props.reference.title}</td>
          <td>{this.props.reference.year}</td>
          <td>{this.props.reference.journal}</td>          
          <td>
            <button className="btn btn-info" onClick={this.handleDelete}>Delete</button>
          </td>
      </tr>
    );
  }
});

var ReferenceTable = React.createClass({

  render: function() {

    var rows = [];
    this.props.references.forEach(function(reference) {
      console.log(reference);
      rows.push(
        <Reference reference={reference} key={reference.author} />);
    });

    return (
      <table className="table table-striped">
          <thead>
              <tr>
                  <th>Author</th>
                  <th>Title</th>
                  <th>Year</th>
                  <th>Journal</th>                  
                  <th>Delete</th>
              </tr>
          </thead>
          <tbody>{rows}</tbody>
      </table>
    );
  }
});

var AddReferencesForm = React.createClass({

  getInitialState: function() {
    return { 
      author: '',
      title: '',
      year: '',
      journal: ''
    };
  },

  handleInputChange: function(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  },

  handleSubmit: function(event) {
    event.preventDefault();

    console.log(event);

    this.props.add({
      author: this.state.author,
      title: this.state.title,
      year: this.state.year,
      journal: this.state.journal
    });
  },

  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Author
          <input type="text" name="author" placeholder={this.state.author} onChange={this.handleInputChange} />
        </label>
        <label>
          Label
          <input type="text" name="title" placeholder={this.state.title} onChange={this.handleInputChange} />
        </label>
        <label>
          Label
          <input type="text" name="year" placeholder={this.state.year} onChange={this.handleInputChange} />
        </label>
        <label>
          Label
          <input type="text" name="journal" placeholder={this.state.journal} onChange={this.handleInputChange} />
        </label>

        <input className="btn btn-info" type="submit" value="Submit" />
      </form>
    )

  }

})

var App = React.createClass({

  loadReferencesFromServer: function() {

    var self = this;
    $.ajax({
        url: "http://localhost:8080/api/references",
      }).then(function(data) {
        self.setState({ references: data._embedded.references });
      });

  },

  getInitialState: function() {
    return { references: [] };
  },

  componentDidMount: function() {
    this.loadReferencesFromServer();
  },

  add(obj) {
    var self = this;
    $.ajax({
        url: "http://localhost:8080/api/references",
        headers: {
            'Content-Type':'application/json'
        },
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify(obj),
        success: function(result) {
          self.setState({ references: self.state.references.concat(result)});
        },
        error: function(xhr, ajaxOptions, thrownError) {
          toastr.error(xhr.responseJSON.message);
        }
    });
  },

  render() {
    return (
      <div>
        <ReferenceTable references={this.state.references} /> 
        <AddReferencesForm add={this.add} />
      </div>
    );
  }
});

ReactDOM.render(<App />, document.getElementById('root') );
