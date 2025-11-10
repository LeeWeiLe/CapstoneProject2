import pygame, sys, random

# Initialize Pygame
pygame.init()

# Constants
WIDTH, HEIGHT = 800, 600
FPS = 60
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Set up the screen
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Educational Pinball")

# Function to display the homepage
def homepage():
    while True:
        screen.fill(WHITE)
        font = pygame.font.Font(None, 74)
        text = font.render("Pinball Game", True, BLACK)
        screen.blit(text, (WIDTH // 2 - text.get_width() // 2, HEIGHT // 4))

        play_button = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2, 200, 50)
        pygame.draw.rect(screen, BLACK, play_button)
        button_text = font.render("Play", True, WHITE)
        screen.blit(button_text, (play_button.x + play_button.width // 2 - button_text.get_width() // 2,
                                   play_button.y + play_button.height // 2 - button_text.get_height() // 2))

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.MOUSEBUTTONDOWN:
                if play_button.collidepoint(event.pos):
                    gameplay()

        pygame.display.flip()

# Function for the gameplay session
def gameplay():
    while True:
        screen.fill(WHITE)
        # Add your pinball game logic here

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        pygame.display.flip()
        pygame.time.Clock().tick(FPS)

# Start the game
homepage()