import Point from "js/pq_games/tools/geometry/point"

enum CardType
{
    BOOK,
    SHELF
}

// DISCARDED "genres": Historical Fiction, Literature, Classics
const GENRES =
{
    // the RED genres
    horror: { color: "red", action: "loss_game", label: "Horror" },
    detective: { color: "red", action: "loss_shelf", label: "Detective" },
    true_crime: { color: "red", action: "loss_hand", label: "True Crime" },
    tragedy: { color: "red", action: "loss_stack", label: "Tragedy" },

    // the GREEN genres
    romance: { color: "green", action: "add_game", label: "Romance" },
    comedy: { color: "green", action: "add_shelf", label: "Comedy & Satire" },
    adventure: { color: "green", action: "add_hand", label: "Adventure" },
    self_help: { color: "green", action: "add_stack", label: "Self-Help" },

    // the BLUE genres
    thriller: { color: "blue", action: "change_move", label: "Thriller" },
    action: { color: "blue", action: "change_swap", label: "Action" },
    travel: { color: "blue", action: "change_remove", label: "Travel Journal" },
    mythology: { color: "blue", action: "change_take", label: "Mythology" },

    // the PURPLE genres
    fantasy: { color: "purple", action: "loosen_play", label: "Fantasy" },
    scifi: { color: "purple", action: "loosen_adjacency", label: "Science-Fiction" },
    poetry: { color: "purple", action: "loosen_order", label: "Poetry" },
    graphic_novel: { color: "purple", action: "loosen_shelves", label: "Graphic Novel" },

    // the YELLOW genres
    biography: { color: "yellow", action: "info_hand", label: "Biography" },
    science: { color: "yellow", action: "info_tap", label: "Science & Nature" },
    business: { color: "yellow", action: "info_carousel", label: "Business & Economics" },
    cooking: { color: "yellow", action: "info_deck", label: "Cooking & Food" },

    // the BLACK genres
    mystery: { color: "black", action: "chaos_oddone", label: "Mystery" },
    crime: { color: "black", action: "chaos_rotate", label: "Crime" },
    drama: { color: "black", action: "chaos_insert", label: "Drama" },
    picture_book: { color: "black", action: "chaos_shift", label: "Picture Book" },
}

const ACTIONS =
{
    loss_game: { frame: 0, label: "Instant Loss", desc: "You lose the game." },
    loss_shelf: { frame: 1, label: "Remove Shelf", desc: "Remove one of the outer book shelves. (All cards inside are discarded.)" },
    loss_hand: { frame: 2, label: "Reduce Hand", desc: "The Hand Limit is permanently lowered by 1." },
    loss_stack: { frame: 3, label: "Stack Nothing", desc: "You can't stack letters on top of each other anymore." },

    add_game: { frame: 4, label: "Reduce Deck", desc: "Remove 5 cards from the deck." },
    add_shelf: { frame: 5, label: "Add Shelf", desc: "Add a Shelf card to the top or bottom of the shelf column." },
    add_hand: { frame: 6, label: "Increase Hand", desc: "The Hand Limit is permanently increased by 1." },
    add_stack: { frame: 7, label: "Stack Any", desc: "You may play cards on top of any other card in your turn." },
    
    change_move: { frame: 8, label: "Move 2", desc: "Move 2 cards to a new empty space adjacent to the library." },
    change_swap: { frame: 9, label: "Swap 2", desc: "Swap 2 cards." },
    change_remove: { frame: 10, label: "Remove 2", desc: "Remove 2 cards from the library. You may replace them with a hand card." },
    change_take: { frame: 11, label: "Take 2", desc: "Take 2 cards from the library into your hand." },
    
    loosen_turn: { frame: 12, label: "No Play", desc: "You don't need to play any card this turn." },
    loosen_adjacency: { frame: 13, label: "No Connection", desc: "You don't need to follow adjacency rules this turn. You can place cards diagonally adjacent or leave a gap of at most 1 card." },
    loosen_order: { frame: 14, label: "No Order", desc: "You don't need to follow alphabetical order this turn." },
    loosen_shelves: { frame: 15, label: "No Shelf Limit", desc: "You don't need to follow the restriction on the number of Book Shelves this turn." },

    info_hand: { frame: 16, label: "Show Hand", desc: "Show your hand to the table." },
    info_tap: { frame: 17, label: "Tap 2", desc: "Tap 2 cards in the library (to give or ask hints)." },
    info_carousel: { frame: 18, label: "Exchange Hands", desc: "All players give their hand to the player on their left/right. (The one executing the power chooses the direction.)" },
    info_deck: { frame: 19, label: "Study Deck", desc: "Study the next 6 cards in the deck. Return them in any order and tell everyone what they are." },

    chaos_oddone: { frame: 20, label: "Complete Wrong", desc: "This turn, you may also complete a genre if it has ONE wrong genre card inside its match." },
    chaos_rotate: { frame: 21, label: "Rotate Shelf", desc: "Rotate a shelf card. Its alphabetical order now goes in the opposite direction as before." },
    chaos_insert: { frame: 22, label: "Insert Card", desc: "Insert a card BETWEEN 2 other cards. Move the rest to fit." },
    chaos_shift: { frame: 23, label: "Shift Column", desc: "Shift an entire column up or down. Cards that go out of bounds wrap to the other side." },
}

//
// all possible book titles
//
const BOOK_TITLES =
{

    // @SOURCE: first 4 pages of https://thegreatestbooks.org/
    one_hundred_years_of_solitude: { label: "100 Years of Solitaire" },
    ulysses: { label: "Ullysees" },
    in_search_of_lost_time: { label: "In Search of Boss Time" },
    great_gatsby: { label: "The Great Goaty" },
    catcher_in_the_rye: { label: "Badger in the Dye" },
    nineteen_eighty_four: { label: "1985" },
    lolita: { label: "Lollyta" },
    don_quixote: { label: "Dont Beshote" },
    moby_dick: { label: "Moby Sick" },
    pride_and_prejudice: { label: "Pride & Prettyfish" },
    crime_and_punishment: { label: "Crime & Bunnyment" },
    anna_karenina: { label: "Anna Karolina" },
    war_and_peace: { label: "War and Cheese" },
    to_kill_a_mockingbird: { label: "To Kill a Shockingherd" },
    wuthering_heights: { label: "Wuthering Thighs" },
    the_grapes_of_wrath: { label: "The Grades of Math" },
    alice_in_wonderland: { label: "Alice in Thunderband" },
    sound_and_the_fury: { label: "Sound and the Jury" },
    heart_of_darkness: { label: "Heart of Darkgrass" },
    madame_bovary: { label: "Madame Gokarty" },
    odyssey: { label: "Odyssays" },
    catch_twenty_two: { label: "Crash-22" },
    brother_karamazov: { label: "Brothers Careformysock" },
    bible: { label: "The Bibell" },
    divine_comedy: { label: "Divine Comesee" },

    beloved: { label: "Belovely" },
    the_stranger: { label: "The Strangler" },
    middlemarch: { label: "Middlemay" },
    lord_of_the_rings: { label: "Lord of the Wings" },
    great_expectations: { label: "Great Imitations" },
    illiad: { label: "Illiadventure" },
    adventures_of_huckleberry_finn: { label: "Adventures of Chuckleferry Gin" },
    to_the_lighthouse: { label: "To the Nightmouse" },
    midnights_children: { label: "Midday's Children" },
    the_trial: { label: "The Trifall" },
    jane_eyre: { label: "Jane Eyresight" },
    invisible_man: { label: "Invisible Plant" },
    magic_mountain: { label: "Magic Molehill" },
    master_and_margarita: { label: "Master and Mayflower" },
    mrs_dalloway: { label: "Mrs. Fallaway" },
    absalom_absalom: { label: "Hairsalon, Hairsalon!" },
    frankenstein: { label: "Frankenstone" },
    on_the_road: { label: "On the Toad" },
    david_copperfield: { label: "David Bronzefield" },
    sun_also_rises: { label: "Sun Also Tries" },
    a_passage_to_india: { label: "A Passage to Sindia" },
    gone_with_the_wind: { label: "Gone With the Mints" },
    gullivers_travels: { label: "Gulliver's Hovels" },
    the_red_and_the_black: { label: "The Bad and the Rack" },
    one_thousand_and_one_nights: { label: "One Thousand and One Knights" },

    tristram_shandy: { label: "Tristram Shanty" },
    color_purple: { label: "Color Purpless" },
    little_prince: { label: "Little Springs" },
    les_miserables: { label: "Les Misingfables" },
    brave_new_world: { label: "Brave New Turd" },
    aeneid: { label: "Aeneedle" },
    things_fall_apart: { label: "Things Talk Alarmed" },
    fictions: { label: "Fictitious" },
    the_stories_of_anton_chekhov: { label: "The Stories of Anton Checkup" },
    love_in_the_time_of_cholera: { label: "Love in the Time of ??" },
    rebecca: { label: "Rebeckoning" },
    portrait_of_a_lady: { label: "Portrait of a Baby" },
    candide: { label: "Candle Feeling" },
    pale_fire: { label: "Pale Hire" },
    harry_potter: { label: "Harry Hotter" },
    lord_of_the_flies: { label: "Lord of the Flights" },
    leaves_of_grass: { label: "Leaves of Sass" },
    eyes_were_watching_god: { label: "Eyes Were Watching Godfather" },
    idiot: { label: "Idiotto" },
    oedipus: { label: "Oedimousse" },
    slaughterhouse_five: { label: "Slaughtermouse Six" },
    hitchhikers_guide_to_the_galaxy: { label: "Hitchy Guide to the Fallacy" },
    diary_of_a_young_girl: { label: "Diary of a Young World" },
    the_tin_drum: { label: "The Thin Gum" },

    as_i_lay_dying: { label: "As I Lay Trying" },
    old_man_and_the_sea: { label: "Old Man and the Bee" },
    handmaids_tale: { label: "Hairbraid's Tale" },
    walden: { label: "Wally" },
    journey_to_the_end_of_the_night: { label: "Journey to the Bedlight" },
    leopard: { label: "Leopardon" },
    for_whom_the_bell_tolls: { label: "For Whom the Bell Rolls" },
    animal_farm: { label: "Animal Barn" },
    waiting_for_godot: { label: "Waiting for Yolo" },
    quiet_on_the_western_front: { label: "Quiet on the Western Sun" },
    demons: { label: "Demonsters" },
    good_soldier: { label: "Groove Soldier"},
    emma: { label: "Emmammoth" },
    silent_spring: { label: "Silent Sting" },
    clockwork_orange: { label: "Clockwork Pear" },
    unbearable_lightness_of_being: { label: "Unbearable Lightness of Seeing" },
    scarlet_letter: { label: "Scarlet Feather" },
    charlottes_web: { label: "Charlotte's Website" },
    essays: { label: "Essings" },
    under_the_volcano: { label: "Under the Volcanto" },
    faust: { label: "Faust Fight" },
    in_cold_blood: { label: "In Cold Hood" },
    little_women: { label: "Little Wombats" },
    paradise_lost: { label: "Paradise Cost" },
    hamlet: { label: "Hamletter" },

    // shakespeare works
    romeo_and_juliet: { label: "Romego & Julihat" },
    macbeth: { label: "Macbath" },
    much_ado_about_nothing: { label: "Much Ado About Toppings" },
    othello: { label: "Othellus" },
    midsummer_nights_dream: { label: "Midsummer Night's Steam" },
    henry_v: { label: "Henry VI" },

    // @SOURCE: https://en.wikipedia.org/wiki/List_of_best-selling_books
    a_tale_of_two_cities: { label: "A Tale of Two Crispies" },
    and_then_there_were_none: { label: "And Then There Were Guns" },
    dream_of_the_red_chamber: { label: "Dream of the Bedchamber" },
    hobbit: { label: "Hobbites" },
    she_a_history_of_adventure: { label: "She: A History of Ads" },
    da_vinci_code: { label: "Da Vinci Mode" },
    bridges_of_madison_county: { label: "Bridges of Madison Bounty" },
    the_alchemist: { label: "The Alchemiss" },
    anne_of_green_gables: { label: "Anne of Green Cables" },
    black_beauty: { label: "Black Duty" },
    name_of_the_rose: { label: "Name of the Ghost" },
    eagle_has_landed: { label: "Eagle has Danced" },
    watership_down: { label: "Watership Up" },
    hite_report: { label: "Hite Rapport" },
    ginger_man: { label: "Ginger Plan" },
    very_hungry_caterpillar: { label: "Very Hungry Caterpillage" },
    jonathan_livingston_seagull: { label: "Jonathan Livingston Seaworld" },
    message_to_garcia: { label: "Message to Mammamia" },
    flowers_in_the_attic: { label: "Flowers in the Lattuce" },
    cosmos: { label: "Cosmosis" },
    sophies_world: { label: "Sophie's Whirl" },
    angels_and_demons: { label: "Angles & Pokemons" },
    kane_and_abel: { label: "Kane & Able" },
    kite_runner: { label: "Kite Drummer" },
    valley_of_the_dolls: { label: "Valley of the Trolls" },
    girl_with_the_dragon_tattoo: { label: "Girl with the Dragon Shoe" },
    gone_girl: { label: "Gone Grill" },
    bermuda_triangle: { label: "Bermuda Square" },
    jaws: { label: "Jawless" },
    where_the_wild_things_are: { label: "Where the Wild Drinks Are" },
    dune: { label: "Duuune" },
    the_book_thief: { label: "The Book Leaf" },
    all_the_light_we_cannot_see: { label: "All the Light we Cannot Eat" },
    fifty_shades_of_grey: { label: "Fifty Shades of Pink" },
    fifty_shades_darker: { label: "Fifty Shades Marker" },
    outsiders: { label: "Outsidoors" },
    wrinkle_in_time: { label: "Wrinkle in Lime" },
    the_exorcist: { label: "The Exorfish" },
    boy_in_the_striped_pyjamas: { label: "Boy with the Striped Pianos" },
    cat_in_the_hat: { label: "Cat in the Cat" },
    fahrenheit_four_five_one: { label: "Fahrenheight 450" },
    bridget_joness_diary: { label: "Bridget Phones' Recipe" },

    // bestselling series
    goosebumps: { label: "Goatbumps" },
    diary_of_a_wimpy_kid: { label: "Diary of a Limbless Kid" },
    sweet_valley_high: { label: "Sweet Valley Low" },
    railway_series: { label: "Railday Series" },
    nancy_drew: { label: "Nancy Draws" },
    geronimo_stilton: { label: "Geronimo Stilltongue" },
    percy_jackson: { label: "Percy Backson" },
    star_wars: { label: "Star Cars" },
    american_girl: { label: "American Boy" },
    james_bond: { label: "James Blond" },
    chronicles_of_narnia: { label: "Chronicles of Narcissist" },
    song_of_ice_and_fire: { label: "Song of Mice and Sire" },
    game_of_thrones: { label: "Game of Drones" },
    wheel_of_time: { label: "Wheel of Grime" },
    discworld: { label: "Discjockeyworld" },
    captain_underpants: { label: "Captain Overpants" },
    vampire_chronicles: { label: "Vampire Comicals" },
    a_series_of_unfortunate_events: { label: "A Series of Unfortunate Hands" },
    jack_reacher: { label: "Jack Reach Her" },
    little_house_on_the_prairie: { label: "Little House of the Dairy" },
    tarzan: { label: "Tarsand" },
    wheres_wally: { label: "Where's Walrus?" },
    eragon: { label: "Era Gone" },

    // fairytales @TODO
    pinocchio: { label: "Piknockio" },

    // roald dahl @TODO
    james_and_the_giant_peach: { label: "James and the Giant Leech" },
    charlie_and_the_chocolate_factory: { label: "Charlie and the Chocolate Battery" },

    // YA / modern hypes @TODO
    hunger_games: { label: "Hunger Dames" },
    catching_fire: { label: "Catching Liar" },
    mockingjay: { label: "Mocking Jay" },
    divergent: { label: "Detergent" },
    twilight: { label: "Twilightbulb" },
    fault_in_our_stars: { label: "Fault in our Cars" },

    // required reading school
    of_mice_and_men: { label: "Of Lies and Plants" },
    count_of_monte_christo: { label: "Count of More Christmas" },
    fall_of_the_house_of_usher: { label: "Fall of the House of Pusher" },
    a_good_man_is_hard_to_find: { label: "A Good Man is Hard to Fly" },
    and_still_i_rise: { label: "And Still I Try" },
    a_brief_history_of_time: { label: "A Brief History of Mimes" },
    on_the_origin_of_species: { label: "On the Origin of Minis" },
    twenty_thousand_leagues_under_the_sea: { label: "2000 Leages under a Pea" },
    last_of_the_mohicans: { label: "Last of the Emojicars" },
    yellow_house: { label: "Yellow Mouse" },
    treasure_island: { label: "Treasure Headband" },
    me_and_earl_and_the_dying_girl: { label: "Me, Earl and the Flying Sir" },

    // letters that are really hard to get
    x_men: { label: "X-Mental" },
    x_marks_the_spot: { label: "X Marks the Shot" },
    xena_warrior_princess: { label: "Xena: Warrior Biceps" },

}

//
// all possible authors
//

const AUTHORS =
{
    shakespeare: { label: "Shakepear", fixed: true },
    orwell: { label: "Doorwell", fixed: true },
    hemingway: { label: "Hemingplay", fixed: true },
    tolstoy: { label: "Toytoy", fixed: true },
    dickens: { label: "Chickens", fixed: true },
    austen: { label: "Austennis", fixed: true },
    sanderson: { label: "Sandthesong", fixed: true },
    rowling: { label: "J.K. Bowling", fixed: true },
    christie: { label: "Agatha Mistme", fixed: true },

    tolkien: { label: "J.R.R. Trollkien" },
    andersen: { label: "Hans Chris Anderdaughter"},
    carroll: { label: "Lewis Cantroll" },
    verne: { label: "Jules Fearme" },
    kafka: { label: "Franz Coughka" },
    eliot: { label: "T.S. Eliotter" },
    fitzgerald: { label: "Scott Fitzgerbil" },
    clancy: { label: "Tom Cantsee" },
    seuss: { label: "Dr. Sausse" },
    king: { label: "Stephen Wing" },
    coelho: { label: "Paulo Couldyo" },
    wallace: { label: "Edgar Wallbass" },
    stine: { label: "R.L. Mine" },
    cartland: { label: "Barbara Heartland" },
    steel: { label: "Danielle Feel" },
    robbins: { label: "Harold Robbthings" },
    simenon: { label: "Georges Seemerun" },
    blyton: { label: "Enid Blytongue" },
    toriyama: { label: "Akira Topyjama" },
    roberts: { label: "Nora Robhers" },
    pushkin: { label: "Alexander Swooshking" },
    patterson: { label: "James Betterson" },
    dahl: { label: "Roald Whale" },
    lewis: { label: "C.S. Knewit" },
    kishimoto: { label: "Masashi Kissmymotto" },
    brown: { label: "Dan Down" },
    lindgren: { label: "Astrid Mintgreen" },
    rice: { label: "Anne Mice" },
    joyce: { label: "James Choice" },
    marques: { label: "Gabriel Marquest" },
    borges: { label: "Jorge Borge" },
    dickinson: { label: "Emily Trickyson" },
    dostoyevsky: { label: "Ohdeer Dostoyevsky" },
    flaubert: { label: "Gustave Flauberry" },
    melville: { label: "Herman Belville" },
    blake: { label: "William Snake" },
    voltaire: { label: "Francois Flowthere" },
    dante: { label: "Durante Dentist" },
    mark: { label: "Quark the Evangetally" },
    homer: { label: "Homerun" },
    virgil: { label: "Publius Virgin" },
    cervantes: { label: "Miguel Cerfantest" },
    milton: { label: "John Mildtoon" },
    james: { label: "E.L. Tamed" },
    roth: { label: "Veronica Goth" },
    meyer: { label: "Stephenie Mayor" },
    bardugo: { label: "Leigh Bardoggo" },
    jordan: { label: "Robert Suredan" },
    martin: { label: "G.R.R. Marthink" },
    lee: { label: "Stan Knee" },
    collins: { label: "Suzanne Call-ins" },
    oda: { label: "Eiichiro Othat" },
    patten: { label: "Gilbert Pattern" },
    sheldon: { label: "Sidney Shelldont" },
    riley: { label: "Lucinda Smiley" },
    pullman: { label: "Philip Pullwand" },
    hosseini: { label: "Khaled Bossandme" },
    alger: { label: "Horatio Algebra" },
    goscinny: { label: "Rene Goskinny" },
    archer: { lable: "Jeffrey Barker" },
}

//
// possible age ranges to pick from (and their probabilities + display values)
//
const AGE_RANGES =
{
    none: { frame: 0, prob: 1.5 },
    kids: { frame: 1, label: "Kids" },
    teens: { frame: 2, label: "Teens" },
    young_adult: { frame: 3, label: "Young Adult" },
    adult: { frame: 4, label: "Adult" } 
}

//
// possible special shelf powers
//
const SHELF_POWERS =
{
    no_stack: { desc: "<b>Stacking</b> cards is <b>forbidden</b>." },
    forbidden_letters: { desc: "Letters %letters% are <b>forbidden</b>." },
    forbidden_colors: { desc: "Colors %colors% are <b>forbidden</b>." },
    restricted_letters: { desc: "Only letters %letters% are allowed to the <b>%side%</b> of me." },
    restricted_colors: { desc: "Only colors %colors% are allowed to the <b>%side%</b> of me." },
    max_cards: { desc: "At most %num% cards are allowed to the <b>%side%</b> of me." },
    wildcard_letters: { desc: "All letters before <b>%letter%</b> are any <b>genre</b> you want." },
    wildcard_colors: { desc: "Any <b>%color%</b> card here is any <b>genre</b> you want." }
}

//
// possible actions for the final expansion (that requires extra material)
//
const ACTIONS_THRILL =
{
    skip: { desc: "The next player must skip their turn." },
    stop: { desc: "End your turn immediately." },
    swap: { desc: "Swap 2 cards." },
    gap: { desc: "The next card may leave a gap of at most 1 card." },
    no_order: { desc: "The next card doesn't need to follow alphabetical order." },
    stack_any: { desc: "The next card may be placed on top of any other card." },
    draw: { desc: "Immediately draw 3 more cards." },
    force_color: { desc: "Name a color. The next player must play such a card, if possible." },
    force_letter: { desc: "Name a letter. The next player must play such a card, if possible." },
    reveal: { desc: "Pick a player. They reveal their hand." },
    clear: { desc: "Clear exactly 5 cards from the library." },
    power_other: { desc: "Pick a power card from another player and execute it yourself." },
}

//
// background colors (separate dict because some are reused and repetition in data is meh)
//
interface ColorTypeData
{
    frame: number,
    main: string,
    light?: string,
    dark?: string,
    letters: string[], // the letters it's allowed to use for its cards
    authorsFixed: string[], // the authors it must include (can have duplicates if to be included twice)
    authorsOptions: string[], // the authors from which it will randomly pick (no duplicates) to fill up remaining space
    series?: number, // how many book series it should have
}

const COLORS:Record<string, ColorTypeData> =
{
    red: { frame: 0, main: "#E61948", light: "#FFCDD9", letters: ["A", "F", "L", "Q", "U", "D"], authorsFixed: ["shakespeare", "tolstoy", "tolstoy", "dickens", "hemingway", "sanderson", "rowling"], authorsOptions: ["tolkien", "andersen", "carroll", "verne", "kafka", "eliot", "fitzgerald", "milton", "james", "riley"] },
    green: { frame: 1, main: "#3CB44B", light: "#CCFFD3", letters: ["B", "E", "M", "R", "V", "G"], authorsFixed: ["orwell", "orwell", "dickens", "austen", "sanderson", "christie"], authorsOptions: ["clancy", "seuss", "king", "coelho", "wallace", "stine", "cartland", "roth", "meyer", "pullman"] },
    blue: { frame: 2, main: "#4363D8", light: "#C5D8FF", letters: ["C", "G", "N", "S", "W", "K"], authorsFixed: ["hemingway", "austen", "dickens", "shakespeare", "sanderson", "christie"], authorsOptions: ["steel", "robbins", "simenon", "blyton", "toriyama", "roberts", "pushkin", "bardugo", "jordan", "hosseini"] },
    purple: { frame: 3, main: "#AD70F4", light: "#DCBEFF", letters: ["D", "H", "O", "T", "X", "O"], authorsFixed: ["shakespeare", "shakespeare", "dickens", "sanderson", "rowling", "rowling"], authorsOptions:  ["patterson", "dahl", "lewis", "kishimoto", "brown", "lindgren", "rice", "martin", "lee", "alger"] },
    yellow: { frame: 4, main: "#FFE119", light: "#FFF9D4", letters: ["E", "I", "K", "P", "Y", "S"], authorsFixed: ["orwell", "orwell", "austen", "austen", "sanderson", "christie"], authorsOptions: ["joyce", "marques", "borges", "dickinson", "dostoyevsky", "flaubert", "melville", "collins", "oda", "goscinny"] },
    black: { frame: 5, main: "#111111", light: "#999999", letters: ["F", "J", "L", "P", "Z", "X"], authorsFixed: ["hemingway", "hemingway", "shakespeare", "tolstoy", "sanderson", "rowling"], authorsOptions: ["blake", "voltaire", "dante", "mark", "homer", "virgil", "cervantes", "patten", "sheldon", "archer"] },
}

const MISC =
{

}

export 
{
    CardType,
    COLORS,
    GENRES,
    ACTIONS,
    AGE_RANGES,
    BOOK_TITLES,
    AUTHORS,
    SHELF_POWERS,
    ACTIONS_THRILL,
    MISC,
}
