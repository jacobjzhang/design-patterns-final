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

  render: function() {
    return (
      <button className="btn btn-info" onClick={this.props.add}>Add</button>
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

  add() {
    var self = this;
    $.ajax({
        url: "http://localhost:8080/api/references",
        headers: {
            'Content-Type':'application/json'
        },
        method: 'POST',
        dataType: 'json',
        data: '{"author" : "Jacob", "title" : "Zhang", "year" : "1991", "journal" : "China" }',
        success: function(result) {
          self.loadReferencesFromServer();
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
