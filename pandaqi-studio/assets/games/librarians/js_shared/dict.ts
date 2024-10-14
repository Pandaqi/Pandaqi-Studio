
enum CardType
{
    BOOK,
    SHELF
}

// DISCARDED "genres": Historical Fiction, Literature, Classics
const GENRES =
{
    // the RED genres
    horror: { frame: 0, color: "red", action: "loss_game", label: "Horror" },
    detective: { frame: 1, color: "red", action: "loss_shelf", label: "Detective" },
    true_crime: { frame: 2, color: "red", action: "loss_hand", label: "True Crime" },
    tragedy: { frame: 3, color: "red", action: "loss_stack", label: "Tragedy" },

    // the GREEN genres
    romance: { frame: 4, color: "green", action: "add_game", label: "Romance" },
    comedy: { frame: 5, color: "green", action: "add_shelf", label: "Comedy" }, // Comedy & Satire
    adventure: { frame: 6, color: "green", action: "add_hand", label: "Adventure" },
    self_help: { frame: 7, color: "green", action: "add_stack", label: "Self-Help" },

    // the BLUE genres
    thriller: { frame: 8, color: "blue", action: "change_move", label: "Thriller" },
    action: { frame: 9, color: "blue", action: "change_swap", label: "Action" },
    travel: { frame: 10, color: "blue", action: "change_remove", label: "Travel" }, // Travel Journal
    mythology: { frame: 11, color: "blue", action: "change_take", label: "Mythology" },

    // the PURPLE genres
    fantasy: { frame: 12, color: "purple", action: "loosen_turn", label: "Fantasy" },
    scifi: { frame: 13, color: "purple", action: "loosen_adjacency", label: "Sci-Fi" }, // Science-Fiction
    poetry: { frame: 14, color: "purple", action: "loosen_order", label: "Poetry" },
    graphic_novel: { frame: 15, color: "purple", action: "loosen_shelves", label: "Graphic Novel" },

    // the YELLOW genres
    biography: { frame: 16, color: "yellow", action: "info_hand", label: "Biography" },
    science: { frame: 17, color: "yellow", action: "info_tap", label: "Science" }, // Science & Nature
    business: { frame: 18, color: "yellow", action: "info_carousel", label: "Business" }, //  & Economics
    cooking: { frame: 19, color: "yellow", action: "info_deck", label: "Cooking" }, //  & Food

    // the BLACK genres
    mystery: { frame: 20, color: "black", action: "chaos_oddone", label: "Mystery" },
    crime: { frame: 21, color: "black", action: "chaos_rotate", label: "Crime" },
    drama: { frame: 22, color: "black", action: "chaos_insert", label: "Drama" },
    picture_book: { frame: 23, color: "black", action: "chaos_shift", label: "Picture Book" },
}

const ACTIONS =
{
    loss_game: { frame: 0, label: "Instant Loss", desc: "You <b>lose</b> the game." },
    loss_shelf: { frame: 1, label: "Remove Shelf", desc: "<b>Remove</b> 1 <b>Shelf</b>. (Discard all its cards.)" },
    loss_hand: { frame: 2, label: "Reduce Hand", desc: "The <b>Hand Limit</b> is permanently <b>lowered</b> by 1." },
    loss_stack: { frame: 3, label: "Stack Nothing", desc: "You <b>can't stack</b> letters on top of each other anymore." },

    add_game: { frame: 4, label: "Reduce Deck", desc: "<b>Remove</b> 5 cards from the <b>deck</b>." },
    add_shelf: { frame: 5, label: "Add Shelf", desc: "<b>Add a Bookshelf</b> to the top or bottom of the shelf column." },
    add_hand: { frame: 6, label: "Increase Hand", desc: "The <b>Hand Limit</b> is permanently <b>increased</b> by 1." },
    add_stack: { frame: 7, label: "Stack Any", desc: "You may play cards <b>on top of any</b> other card in your turn." },
    
    change_move: { frame: 8, label: "Move 2", desc: "<b>Move</b> 2 cards to an empty space adjacent to the Library." },
    change_swap: { frame: 9, label: "Swap 2", desc: "<b>Swap</b> 2 cards." },
    change_remove: { frame: 10, label: "Remove 2", desc: "<b>Remove</b> 2 cards from the <b>Library</b>." }, // (Optional: replace with hand card).
    change_take: { frame: 11, label: "Take 2", desc: "<b>Take</b> 2 cards from the Library <b>into your hand</b>." },
    
    loosen_turn: { frame: 12, label: "No Play", desc: "This turn, you <b>don't need to play</b> any card." },
    loosen_adjacency: { frame: 13, label: "No Connection", desc: "This turn, <b>adjacency</b> rules (when playing cards) are <b>ignored</b>." },
    loosen_order: { frame: 14, label: "No Order", desc: "This turn, alphabetical <b>order</b> is <b>not required</b>." },
    loosen_shelves: { frame: 15, label: "No Shelf Limit", desc: "This turn, there is <b>no maximum</b> number of <b>Shelves</b>." },

    info_hand: { frame: 16, label: "Show Hand", desc: "<b>Show</b> your hand to the table." },
    info_tap: { frame: 17, label: "Tap 2", desc: "<b>Tap</b> 2 cards in the Library (for hinting)." },
    info_carousel: { frame: 18, label: "Exchange Hands", desc: "All players <b>give</b> their hand to the <b>player on their left</b>." },
    info_deck: { frame: 19, label: "Study Deck", desc: "<b>Reveal</b> the next 6 deck cards. Return them in any order." },

    chaos_oddone: { frame: 20, label: "Complete Wrong", desc: "This turn, you also <b>complete a genre</b> if it has one <b>wrong</b> card." },
    chaos_rotate: { frame: 21, label: "Rotate Shelf", desc: "<b>Rotate</b> a shelf card (to reverse direction)." },
    chaos_insert: { frame: 22, label: "Insert Card", desc: "<b>Insert</b> a card between 2 cards. Move the rest to fit." },
    chaos_shift: { frame: 23, label: "Shift Column", desc: "<b>Shift</b> an entire column up or down." }, // Off-bounds cards wrap to the other side.
}

//
// all possible book titles
//
interface BookTitle
{
    label: string,
    initial?: string
}

const BOOK_TITLES:Record<string, BookTitle> =
{

    // @SOURCE: first 4 pages of https://thegreatestbooks.org/
    one_hundred_years_of_solitude: { label: "100 Years of Solitaire", initial: "Y" },
    ulysses: { label: "Ullysees" },
    in_search_of_lost_time: { label: "In Search of Boss Time" },
    great_gatsby: { label: "The Great Goaty" },
    catcher_in_the_rye: { label: "Badger in the Dye" },
    nineteen_eighty_four: { label: "1985", initial: "N" },
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
    love_in_the_time_of_cholera: { label: "Love in the Time of Chocolate" },
    rebecca: { label: "Rebeckoning" },
    portrait_of_a_lady: { label: "Portrait of a Baby" },
    candide: { label: "Candle Feeding" },
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

    // fairytales
    pinocchio: { label: "Piknockio" },
    little_red_riding_hood: { label: "Little Bad Riding Foot" },
    jack_and_the_beanstalk: { label: "Jack and the Lean Walk" },
    ugly_duckling: { label: "Ugly Darkling" },
    hansel_and_gretel: { label: "Hansel and Forgetel" },
    goldilocks_and_the_three_bears: { label: "Goldilocks and the Tree Fears" },
    rumpelstiltskin: { label: "Rumpelwillwin" },
    three_little_pigs: { label: "Three Little Wigs" },
    cinderella: { label: "Cindumbrella" },
    sleeping_beauty: { label: "Sleeping Fury" },
    rapunzel: { label: "Rapunsole" },
    frog_prince: { label: "Frog Fringe" },
    snow_white_and_the_seven_dwarfs: { label: "Snow White and the Heaven Stars" },
    little_mermaid: { label: "Little Moremaid" },
    princess_and_the_pea: { label: "Princess and the Pee" },
    emperors_new_clothes: { label: "Emperor's New Votes" },
    beauty_and_the_beast: { label: "Baby and the Beat" },
    puss_in_boots: { label: "Puss in Kahoots" },
    aladdin: { label: "Althathings" },
    gingerbread_man: { label: "Gingerbread Dance" },

    // roald dahl
    james_and_the_giant_peach: { label: "James and the Giant Leech" },
    charlie_and_the_chocolate_factory: { label: "Charlie and the Chocolate Battery" },
    big_friendly_giant: { label: "Big Friendly Tyrant" },
    matilda: { label: "Matilday" },
    the_witches: { label: "The Wishes" },
    fantastic_mr_fox: { label: "Fantastic Mr. Fog" },

    // YA / modern hypes
    hunger_games: { label: "Hunger Dames" },
    catching_fire: { label: "Catching Liar" },
    mockingjay: { label: "Mocking Jay" },
    divergent: { label: "Detergent" },
    twilight: { label: "Twilightbulb" },
    fault_in_our_stars: { label: "Fault in our Cars" },
    the_princess_diaries: { label: "The Princess Diabetes" },
    sisterhood_of_the_traveling_pants: { label: "Sisterhood of the Baffling Fans" },
    perks_of_being_a_wallflower: { label: "Perks of Being a Smalltower" },
    looking_for_alaska: { label: "Looking for a Maska" },
    maze_runner: { label: "Maze Rudder" },
    shadow_and_bone: { label: "Shadow and Stone" },
    six_of_crows: { label: "Six of Hose" },
    red_rising: { label: "Red Timing" },
    one_of_us_is_lying: { label: "One of Us is Dying" },
    mistborn: { label: "Mistthorn" },
    scythe: { label: "Sighthe" },
    his_dark_materials: { label: "His Fart Materials" },

    // required reading school
    of_mice_and_men: { label: "Of Lies and Plants" },
    count_of_monte_christo: { label: "Count of More Christmas" },
    fall_of_the_house_of_usher: { label: "Fall of the House of Pusher" },
    a_good_man_is_hard_to_find: { label: "A Good Man is Hard to Fly" },
    and_still_i_rise: { label: "And Still I Try" },
    a_brief_history_of_time: { label: "A Brief History of Mimes" },
    on_the_origin_of_species: { label: "On the Origin of Minis" },
    twenty_thousand_leagues_under_the_sea: { label: "2000 Leagues under a Pea", initial: "L" },
    last_of_the_mohicans: { label: "Last of the Emojicars" },
    yellow_house: { label: "Yellow Mouse" },
    treasure_island: { label: "Treasure Headband" },
    me_and_earl_and_the_dying_girl: { label: "Me, Earl and the Flying Sir" },

    // filling up the letters that are really hard to get
    enders_game: { label: "Ender's Name" },
    east_of_eden: { label: "East of Demon" },
    eclipse: { label: "Eclipped" },
    eat_pray_love: { label: "Eat, Sway, Dove" },

    i_robot: { label: "I, Romcom" },
    i_am_legend: { label: "I Am Pageant" },
    i_know_why_the_caged_bird_sings: { label: "I Know Why the Safebird Sings" },
    into_the_wild: { label: "Into the Smile" },
    it: { label: "It Support" },

    knight_of_the_seven_kingdoms: { label: "Knight of the Seven Romcoms" },
    keeper: { label: "Keepurr" },
    kira_kira: { label: "Kira-Kari" },
    kidnapped: { label: "Kidnapper" },
    kafka_on_the_shore: { label: "Kafka on your Door" },
    killing_mr_griffin: { label: "Killing Mr. Giving" },
    killer_smile: { label: "Killer File" },
    kingdom_of_shadows: { label: "Kingdom of Meadows" },

    name_of_the_wind: { label: "Name of the Witch" },
    never_let_me_go: { label: "Never Let Me Snow" },
    neverwhere: { label: "Neverwhy" },
    night_circus: { label: "Night Cactus" },
    naked_in_death: { label: "Naked in Laugh" },
    namesake: { label: "Nameshake" },
    northanger_abbey: { label: "North Angry Abby" },

    quiet_the_power_of_introverts: { label: "Quiet: The Power of Introbirds" },
    quidditch_through_the_ages: { label: "Quidditch Through the Mazes" },
    queens_gambit: { label: "Queen's Megabit" },
    queen_of_the_damned: { label: "Queen of the Rams" },
    quicksand: { label: "Quickhand" },
    quarantine: { label: "Quarryteen" },
    quick_bite: { label: "Quick Bait" },
    quiet_gentleman: { label: "Quiet Gentleband" },
    question_of_love: { label: "Question of Gloves" },

    robinson_crusoe: { label: "Robinson Cruiseship" },
    ready_player_one: { label: "Ready Player Two" },
    return_of_the_king: { label: "Return of the Swing" },
    restaurant_at_the_end_of_the_universe: { label: "Restaurant at the End of the Purse" },
    return_of_the_native: { label: "Return of the Plaintiff" },

    utopia: { label: "Utopiary" },
    uncle_toms_cabin: { label: "Uncle Tom's Halfling" },
    unexpected_mrs_pollifax: { label: "Unexpected Mrs. Zodiacs" },
    uglies: { label: "Ugliest" },

    v_for_vendetta: { label: "V for Vending Machine" },
    valkyries: { label: "Valkypies" },
    vampire_academy: { label: "Vampire Acarryme" },
    vandal_love: { label: "Vandal Shove" },
    vanishing_girl: { label: "Vanishing Grill" },
    vacant_possession: { label: "Vacant Aggression" },

    x_men: { label: "X-Mental" },
    x_marks_the_spot: { label: "X Marks the Shot" },
    xena_warrior_princess: { label: "Xena: Warrior Biceps" },
    xenocide: { label: "Xenolies" },
    x_it: { label: "X-That" },
    x_isle: { label: "X-Isled" },
    xoxo: { label: "XOXOXOPEN" },

    year_in_provence: { label: "Year Improvised" },
    yiddish_for_pirates: { label: "Yiddish for Pamphlets" },
    you_deserve_nothing: { label: "You Deserve Hot Wings" },
    yellow_wallpaper: { label: "Yellow Wall Flavor" },
    youth: { label: "You" },
    y_the_last_man: { label: "Y: The Last Plant" },
    you_shall_know_our_velocity: { label: "You Shall Know Our Monstrosity" },
    yours_jack: { label: "Yours, Jacky" },

    zeitgeist: { label: "Zeitgeiser" },
    zorro: { label: "Zorrow" },
    zookeepers_wife: { label: "Zookeeper's Life" },
    zanzibar_cat: { label: "Zanzibar Flat" },
    zealots_bones: { label: "Zealot's Thrones" },
    zen_and_the_art_of_vampires: { label: "Zen and the Art of Fanfires" },
    zelda: { label: "Zeldom" },
    zombie: { label: "Zombean" }, 
    zolotov_affair: { label: "Zolotov, A Fire" },
    zoo_city: { label: "Zoo Pity" }
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
    none: { frame: 0, label: "Any", prob: 1.5 },
    kids: { frame: 1, label: "Kids" },
    teens: { frame: 2, label: "Teens" },
    young_adult: { frame: 3, label: "Young Adult" },
    adult: { frame: 4, label: "Adult" } 
}

//
// possible special shelf powers
//
interface ShelfPowerData
{
    desc: string,
    min?: number,
    prob?: number
}

const SHELF_POWERS:Record<string, ShelfPowerData> =
{
    no_stack: { desc: "<b>Stacking</b> cards is <b>forbidden</b>." },
    forbidden_letters: { desc: "Letters <b>%letters%</b> are <b>forbidden</b>." },
    forbidden_colors: { desc: "Colors <b>%colors%</b> are <b>forbidden</b>." },
    restricted_letters: { desc: "Only letters <b>%letters%</b> are allowed to the <b>%side%</b> of me." },
    restricted_colors: { desc: "Only colors <b>%colors%</b> are allowed to the <b>%side%</b> of me." },
    max_cards: { desc: "<b>At most %num%</b> cards are allowed to the <b>%side%</b> of me." },
    wildcard_letters: { desc: "All letters before <b>%letter%</b> are any <b>genre</b> you want." },
    wildcard_colors: { desc: "Any <b>%color%</b> card here is any <b>genre</b> you want." }
}

//
// possible actions for the final expansion (that requires extra material)
//
interface ActionThrillData
{
    desc: string,
    label: string,
    freq?: number
}

const ACTIONS_THRILL:Record<string,ActionThrillData> =
{
    skip: { label: "Skip!", desc: "The next player must <b>skip</b> their turn." },
    stop: { label: "Stop!", desc: "<b>End</b> your turn immediately." },
    swap: { label: "Swap!", desc: "<b>Swap</b> 2 cards." },
    gap: { label: "Gap!", desc: "The next card may <b>leave a gap</b> of at most 1 card." },
    no_order: { label: "No Order!", desc: "The next card <b>doesn't</b> need to follow <b>alphabetical order</b>." },
    stack_any: { label: "Stack Any!", desc: "The next card may be placed <b>on top of any</b> other card." },
    draw: { label: "Draw!", desc: "<b>Draw</b> 3 more cards." },
    force_color: { label: "Force Color!", desc: "Name a <b>color</b>. The next player <b>must play</b> such a card, if possible." },
    force_letter: { label: "Force Letter!", desc: "Name a <b>letter</b>. The next player <b>must play</b> such a card, if possible." },
    reveal: { label: "Reveal!", desc: "Pick a player. They <b>reveal</b> their hand." },
    clear: { label: "Clear!", desc: "<b>Remove</b> 5 cards from the Library." },
    power_other: { label: "Steal Power!", desc: "Pick a <b>power card</b> from another player and <b>execute it</b> yourself." },
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
}

const COLORS:Record<string, ColorTypeData> =
{
    red: { frame: 0, main: "#E61948", light: "#FFCDD9", dark: "#220000", letters: ["A", "F", "L", "Q", "U", "D"], authorsFixed: ["shakespeare", "rowling", "rowling", "rowling", "hemingway", "dickens", "sanderson", "tolstoy"], authorsOptions: ["tolkien", "andersen", "carroll", "verne", "kafka", "eliot", "fitzgerald", "milton", "james", "riley"] },
    green: { frame: 1, main: "#3CB44B", light: "#CCFFD3", dark: "#002200", letters: ["B", "E", "M", "R", "V", "G"], authorsFixed: ["orwell", "orwell", "orwell", "austen", "sanderson", "christie"], authorsOptions: ["clancy", "seuss", "king", "coelho", "wallace", "stine", "cartland", "roth", "meyer", "pullman"] },
    blue: { frame: 2, main: "#4363D8", light: "#C5D8FF", dark: "#000022", letters: ["C", "G", "N", "S", "W", "K"], authorsFixed: ["hemingway", "austen", "dickens", "dickens", "dickens", "shakespeare", "sanderson", "christie"], authorsOptions: ["steel", "robbins", "simenon", "blyton", "toriyama", "roberts", "pushkin", "bardugo", "jordan", "hosseini"] },
    purple: { frame: 3, main: "#AD70F4", light: "#DCBEFF", dark: "#220022", letters: ["D", "H", "O", "T", "X", "O"], authorsFixed: ["shakespeare", "shakespeare", "shakespeare", "dickens", "sanderson", "rowling"], authorsOptions:  ["patterson", "dahl", "lewis", "kishimoto", "brown", "lindgren", "rice", "martin", "lee", "alger"] },
    yellow: { frame: 4, main: "#FFE119", light: "#FFF9D4", dark: "#222200", letters: ["E", "I", "K", "P", "Y", "S"], authorsFixed: ["orwell", "orwell", "austen", "austen", "austen", "sanderson", "christie"], authorsOptions: ["joyce", "marques", "borges", "dickinson", "dostoyevsky", "flaubert", "melville", "collins", "oda", "goscinny"] },
    black: { frame: 5, main: "#AAAAAA", light: "#FFFFFF", dark: "#333333", letters: ["F", "J", "L", "P", "Z", "X"], authorsFixed: ["hemingway", "hemingway", "hemingway", "shakespeare", "tolstoy", "sanderson", "rowling"], authorsOptions: ["blake", "voltaire", "dante", "mark", "homer", "virgil", "cervantes", "patten", "sheldon", "archer"] },
    default: { frame: -1, main: "#FFFFFF00", light: "#FFFFFF", dark: "#000000", letters: [], authorsFixed: [], authorsOptions: [] },
}

const MISC =
{
    author_icon: { frame: 0 },
    age_icon: { frame: 1 },
    bookshelf_arrow: { frame: 2 },
    rect_rounded: { frame: 3 },
    
}

export {
    ACTIONS, ACTIONS_THRILL, AGE_RANGES, AUTHORS, BOOK_TITLES, COLORS, CardType, GENRES, MISC, SHELF_POWERS
}

