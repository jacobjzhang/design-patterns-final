package project;

import project.storage.StorageFileNotFoundException;
import project.storage.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.MvcUriComponentsBuilder;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import org.jbibtex.BibTeXDatabase;
import org.jbibtex.BibTeXEntry;
import org.jbibtex.BibTeXParser;
import org.jbibtex.Key;
import org.jbibtex.ParseException;
import org.jbibtex.TokenMgrException;
import org.jbibtex.Value;
import org.jbibtex.StringValue;

import java.io.Reader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

import java.io.IOException;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.List;
import java.util.Map.Entry;
import java.util.Collection;


@Controller
public class FileParseController {

    private final ReferenceRepository repository;
    private final StorageService storageService;

    @Autowired
    public FileParseController(ReferenceRepository repository, StorageService storageService) {
      this.repository = repository;
      this.storageService = storageService;
    }

    @PostMapping("/parsecsv")
    @ResponseBody
    public void showParsedCsv(@RequestParam("filename") String filename, Model model)
      throws IOException, ParseException {

      System.out.println("In parse CSV map");

      System.out.println(filename);

      Reader crunchifyBuffer = null;

      try {

        Resource file = storageService.loadAsResource(filename);
  			String crunchifyLine;

  			crunchifyBuffer = new FileReader(file.getFile());
        org.jbibtex.BibTeXParser bibtexParser = new org.jbibtex.BibTeXParser();
        org.jbibtex.BibTeXDatabase database = bibtexParser.parse(crunchifyBuffer);

        final Map<Key, BibTeXEntry> entries = database.getEntries();

        for (Entry<Key, BibTeXEntry> entry : entries.entrySet() ) {
          String author = entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_AUTHOR) != null ? entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_AUTHOR).toUserString() : "Author";
          String title = entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_TITLE) != null ? entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_TITLE).toUserString() : "Title";
          String year = entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_YEAR) != null ? entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_YEAR).toUserString() : "Year";
          String journal = entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_JOURNAL) != null ? entry.getValue().getField(org.jbibtex.BibTeXEntry.KEY_JOURNAL).toUserString() : "Journal";

          Reference ref = new Reference();
          ref.setAuthor(author);
          ref.setTitle(title);
          ref.setYear(year);
          ref.setJournal(journal);
          repository.save(ref);

          // Map<Key, Value> fields = entry.getValue().getFields();
          // for (Entry<Key, Value> field : fields.entrySet()) {
          //    System.out.println(field.getKey() + " : " + field.getValue().toUserString());
          // }
          //
          // System.out.println("----------------------");

        }

      } catch (IOException e) {
  			e.printStackTrace();

  		} finally {
  			try {
  				if (crunchifyBuffer != null) crunchifyBuffer.close();
  			} catch (IOException crunchifyException) {
  				crunchifyException.printStackTrace();
  			}
  		}

    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }

}
