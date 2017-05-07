package project;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
  public class Reference {

  @Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long id;

    private String author;
    private String title;
    private String year;
    private String journal;

    // public Reference(String author, String title, String year, String journal) {
    //     this.author = author;
    //     this.title = title;
    //     this.year = year;
    //     this.journal = journal;
    // }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getJournal() {
        return journal;
    }

    public void setJournal(String journal) {
        this.journal = journal;
    }


}
