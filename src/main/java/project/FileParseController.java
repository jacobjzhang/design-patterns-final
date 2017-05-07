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

// import org.apache.http.HttpEntity;
// import org.apache.http.HttpResponse;
// import org.apache.http.client.HttpClient;
// import org.apache.http.client.methods.HttpPost;
// import org.apache.http.entity.StringEntity;

import org.jbibtex.BibTeXDatabase;
import org.jbibtex.BibTeXEntry;
import org.jbibtex.BibTeXParser;
import org.jbibtex.Key;
import org.jbibtex.ParseException;
import org.jbibtex.TokenMgrException;
import org.jbibtex.Value;
import org.jbibtex.StringValue;

// For file reading
import java.io.Reader;
// import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;

import java.io.IOException;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.List;
import java.util.Map.Entry;

import java.util.Collection;
import com.mashape.unirest.http.HttpResponse;
import com.mashape.unirest.http.JsonNode;
import com.mashape.unirest.http.Unirest;
import com.mashape.unirest.http.exceptions.UnirestException;

// public class StringValue {
//
//     @Override
//     public String toString() {
//         String yourResult = this.type; // + ...
//         return yourResult;
//     }
//
// }

@Controller
public class FileParseController {

    private final ReferenceRepository repository;
    private final StorageService storageService;


    @Autowired
    public FileParseController(ReferenceRepository repository, StorageService storageService) {
        this.repository = repository;
        this.storageService = storageService;
    }

    @GetMapping("/parsecsv/{filename:.+}")
    public String showParsedCsv(Model model, @PathVariable String filename) throws IOException, ParseException, UnirestException {
      System.out.println("In parse CSV map");

      System.out.println(filename);

      Reader crunchifyBuffer = null;

      // String toDisplay = new String();
      try {

        Resource file = storageService.loadAsResource(filename);
  			String crunchifyLine;
  			crunchifyBuffer = new FileReader(file.getFile());

        org.jbibtex.BibTeXParser bibtexParser = new org.jbibtex.BibTeXParser();

        org.jbibtex.BibTeXDatabase database = bibtexParser.parse(crunchifyBuffer);

        // final Map<Key, BibTeXEntry> entries = database.getEntries();
        // Map<org.jbibtex.Key, org.jbibtex.BibTeXEntry> entryMap = database.getEntries();
        final Map<Key, BibTeXEntry> entries = database.getEntries();

        System.out.println("Found " + entries.size() + " entries.");


        for (Entry<Key, BibTeXEntry> entry : entries.entrySet() ) {
        // Collection<org.jbibtex.BibTeXEntry> entries = entryMap.values();
        // for(org.jbibtex.BibTeXEntry entry : entries){
           //
          //  org.jbibtex.Value value = entry.getField(org.jbibtex.BibTeXEntry.KEY_TITLE);
           //
          //  String thisStr = value.toUserString();
          //  String latexString = thisStr;
           //
          //   org.jbibtex.LaTeXParser latexParser = new org.jbibtex.LaTeXParser();
           //
          //   List<org.jbibtex.LaTeXObject> latexObjects = latexParser.parse(latexString);
           //
          //   org.jbibtex.LaTeXPrinter latexPrinter = new org.jbibtex.LaTeXPrinter();
           //
          //   String plainTextString = latexPrinter.print(latexObjects);
           //
          //   System.out.println(plainTextString);
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

Map<Key, Value> fields = entry.getValue().getFields();
            for (Entry<Key, Value> field : fields.entrySet()) {

              //  toDisplay = toDisplay.concat(field.getKey() + "=" + field.getValue().toUserString() + "&");
               System.out.println(field.getKey() + " : " + field.getValue().toUserString());
            }

        // for (Entry<Key, BibTeXEntry> entry : entries.entrySet() ) {
        //    System.out.println("key:" + entry.getKey());

           System.out.println("----------------------");

        }

        // HTTP POST REQUEST?
        //
        // model.addAttribute("entries", toDisplay);

      } catch (IOException e) {
  			e.printStackTrace();
  		} finally {
  			try {
  				if (crunchifyBuffer != null) crunchifyBuffer.close();
  			} catch (IOException crunchifyException) {
  				crunchifyException.printStackTrace();
  			}
  		}

      // HttpResponse<JsonNode> jsonResponse = Unirest.post("http://localhost:8080/api/references")
      //   .header("accept", "application/json")
      //   .queryString("apiKey", "123")
      //   .field("parameter", "value")
      //   .field("foo", "bar")
      //   .asJson();

      // System.out.println(jsonResponse);

      String finalUrl = "redirect:/index.html";
      return finalUrl;

    }

    @ExceptionHandler(StorageFileNotFoundException.class)
    public ResponseEntity handleStorageFileNotFound(StorageFileNotFoundException exc) {
        return ResponseEntity.notFound().build();
    }

}
